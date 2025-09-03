'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ekiden$1 = require('../ekiden.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class ekiden extends ekiden$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.ekiden.fi/ws',
                    },
                },
            },
            'streaming': {
                'keepAlive': 20000,
            },
            'options': {
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'ordersPollInterval': 2000,
            },
        });
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        // subscribe to public trades channel and aggregate candles client-side
        const channel = 'trades/' + market['id'];
        const url = this.urls['api']['ws']['public'];
        const request = {
            'method': 'subscribe',
            'channel': channel,
        };
        // ensure cache exists for this symbol/timeframe
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const ohlcvLimit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(ohlcvLimit);
        }
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        const ohlcv = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // HTTP polling-based watcher since Ekiden WS has no orders channel yet
        await this.loadMarkets();
        this.checkRequiredCredentials(false);
        let market = undefined;
        let messageHash = 'order';
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.urls['api']['ws']['public'];
        const client = this.client(url);
        if (this.safeValue(client.subscriptions, messageHash) === undefined) {
            client.subscriptions[messageHash] = true;
            this.spawn(this.watchOrdersLoop, client, messageHash, market, params);
        }
        const future = client.future(messageHash);
        const orders = await future;
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    async watchOrdersLoop(client, messageHash, market = undefined, params = {}) {
        const pollMs = this.safeInteger(this.options, 'ordersPollInterval', 2000);
        try {
            const request = {};
            if (market !== undefined) {
                request['market_addr'] = market['id'];
            }
            // fetch the latest user orders (both open/closed)
            const response = await this.v1PrivateGetUserOrders(this.extend(request, params));
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const orders = this.parseOrders(response, market);
            const symbols = {};
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                stored.append(order);
                const sym = this.safeString(order, 'symbol');
                if (sym !== undefined) {
                    symbols[sym] = true;
                }
            }
            // resolve both generic and per-symbol streams
            client.resolve(stored, 'order');
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const sym = keys[i];
                const innerHash = 'order' + ':' + sym;
                client.resolve(stored, innerHash);
            }
        }
        catch (e) {
        }
        this.delay(pollMs, this.watchOrdersLoop, client, messageHash, market, params);
    }
    handleMessage(client, message) {
        // Ekiden WS message format (server-side):
        // { type: 'event' | 'subscribed' | 'unsubscribed' | 'pong' | 'error', channel?: string, data?: { type: 'trades' | 'orderbook_snapshot' | 'orderbook_delta', ... } }
        const topType = this.safeString(message, 'type');
        if (topType === 'event') {
            const channel = this.safeString(message, 'channel');
            const data = this.safeDict(message, 'data', {});
            const eventType = this.safeString(data, 'type');
            if ((channel !== undefined) && (channel.indexOf('trades/') === 0) && (eventType === 'trades')) {
                this.handleTradesForOHLCV(client, message);
            }
            // ignore orderbook events here (no watchOrderBook implemented yet)
        }
        if (topType === 'error') {
            const err = this.id + ' ' + this.json(message);
            client.reject(err);
        }
        // subscribed / unsubscribed / pong can be ignored
    }
    handleTradesForOHLCV(client, message) {
        const data = this.safeDict(message, 'data', {});
        const marketAddr = this.safeString(data, 'market_addr');
        const market = this.safeMarket(marketAddr);
        const symbol = market['symbol'];
        const baseDecimals = this.safeInteger(market['info'] || {}, 'base_decimals');
        const quoteDecimals = this.safeInteger(market['info'] || {}, 'quote_decimals');
        const trades = this.safeList(data, 'trades', []);
        if (!(symbol in this.ohlcvs)) {
            // nothing to deliver if there are no OHLCV subscriptions for this symbol
            return;
        }
        const timeframes = Object.keys(this.ohlcvs[symbol]);
        if (timeframes.length === 0) {
            return;
        }
        for (let i = 0; i < trades.length; i++) {
            const tr = this.safeDict(trades, i);
            const ts = this.safeInteger(tr, 'timestamp');
            const timestamp = (ts !== undefined) ? (ts * 1000) : undefined;
            const priceInt = this.safeInteger(tr, 'price');
            const sizeInt = this.safeInteger(tr, 'size');
            const price = (quoteDecimals !== undefined && priceInt !== undefined) ? (priceInt / Math.pow(10, quoteDecimals)) : undefined;
            const amount = (baseDecimals !== undefined && sizeInt !== undefined) ? (sizeInt / Math.pow(10, baseDecimals)) : undefined;
            if ((timestamp === undefined) || (price === undefined) || (amount === undefined)) {
                continue;
            }
            for (let j = 0; j < timeframes.length; j++) {
                const timeframe = timeframes[j];
                this.appendOHLCVFromTrade(symbol, timeframe, timestamp, price, amount);
            }
        }
        for (let j = 0; j < timeframes.length; j++) {
            const timeframe = timeframes[j];
            const messageHash = 'candles:' + timeframe + ':' + symbol;
            const cache = this.ohlcvs[symbol][timeframe];
            client.resolve(cache, messageHash);
        }
    }
    appendOHLCVFromTrade(symbol, timeframe, timestamp, price, amount) {
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const duration = this.parseTimeframe(timeframe) * 1000;
        const start = this.parseToInt(Math.floor(timestamp / duration) * duration);
        const existing = stored.hashmap[start];
        if (existing !== undefined) {
            const open = existing[1];
            const high = Math.max(existing[2], price);
            const low = Math.min(existing[3], price);
            const close = price;
            const volume = this.sum(existing[5], amount);
            stored.append([start, open, high, low, close, volume]);
        }
        else {
            stored.append([start, price, price, price, price, amount]);
        }
    }
}

exports["default"] = ekiden;
