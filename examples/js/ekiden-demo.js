import ccxt from '../../js/ccxt.js';

process.on('unhandledRejection', (e) => { console.error(e); process.exit(1); });

async function main () {
    const ex = new ccxt.pro.ekiden({
        sandbox: true,
        apiKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIweGIwYWYyMjI3Zjc0YWNiNzBmNDI0NzViMzVhMjMxMjcyNGY1NjExY2MzZmI0YWQxYzhkNmYzMWQxZDBhOGIyMDciLCJpYXQiOjE3NTY4OTU3ODAsImV4cCI6MTc1NzUwMDU4MCwicHVibGljX2tleSI6IjB4MDQ4NTY0MWI4N2ZiZGEyNjMyN2Q4MGYwMjlmNzQwNTgxODY2NjU0MzEzZWVlYzljNWJiOGYyOWRmY2JiNTljYyIsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtdXNlci1pZCI6IjB4YjBhZjIyMjdmNzRhY2I3MGY0MjQ3NWIzNWEyMzEyNzI0ZjU2MTFjYzNmYjRhZDFjOGQ2ZjMxZDFkMGE4YjIwNyIsIngtaGFzdXJhLXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciJdfX0.jUx1nQH_YzzgDOOITZxvFmu0ayQuBE4qDus40zX99IE",
        secret: "0x1f6bdaeb6cd4e89f43eeddeaae7525ec5797d7f304b00005bd005ec7e4c49fc9"
    });

    console.log('Loading markets...');
    const markets = await ex.loadMarkets();
    const symbols = Object.keys(markets);
    if (symbols.length === 0) {
        console.log('No markets available');
        return;
    }
    const symbol = symbols[0];
    console.log('Using symbol:', symbol);

    // fetchTicker
    try {
        const ticker = await ex.fetchTicker(symbol);
        console.log('fetchTicker:', { last: ticker.last, high: ticker.high, low: ticker.low });
    } catch (e) {
        console.log('fetchTicker failed:', e.message);
    }

    // fetchOHLCV
    try {
        const ohlcv = await ex.fetchOHLCV(symbol, '1h', undefined, 5);
        console.log('fetchOHLCV length:', ohlcv.length, 'first:', ohlcv[0]);
    } catch (e) {
        console.log('fetchOHLCV failed:', e.message);
    }

    // fetchOrderBook
    try {
        const ob = await ex.fetchOrderBook(symbol, 10);
        console.log('fetchOrderBook top:', { bid: ob.bids[0], ask: ob.asks[0] });
    } catch (e) {
        console.log('fetchOrderBook failed:', e.message);
    }

    // fetchTrades
    try {
        const trades = await ex.fetchTrades(symbol, undefined, 5);
        console.log('fetchTrades length:', trades.length /*, 'first:', trades[0] */);
    } catch (e) {
        console.log('fetchTrades failed:', e.message);
    }

    // fetchBalance
    try {
        const balances = await ex.fetchBalance();
        const codes = Object.keys(balances).filter((k) => !['info', 'timestamp', 'datetime'].includes(k));
        if (codes.length) {
            const code = codes[0];
            const { free, used, total } = balances[code] || {};
            console.log('fetchBalance:', code, { free, used, total });
        } else {
            console.log('fetchBalance: no balances');
        }
    } catch (e) {
        console.log('fetchBalance failed (requires auth):', e.message);
    }

    // watchOHLCV (Pro)
    try {
        if (ex.has['watchOHLCV']) {
            console.log('Subscribing to 1m candles via WS...');
            const ohlcvStream = await ex.watchOHLCV(symbol, '1m');
            const recent = ohlcvStream.slice(-3);
            console.log('watchOHLCV size:', ohlcvStream.length /*, 'recent:', recent*/);
        } else {
            console.log('watchOHLCV not supported by this build');
        }
    } catch (e) {
        console.log('watchOHLCV failed:', e.message);
    }

    // createOrder (auto-signed intent)
    let createdOrder1
    try {
        createdOrder1 = await ex.createOrder(symbol, 'limit', 'buy', 0.001, 1, { leverage: 1, commit: true });
        console.log('createOrder:', createdOrder1.id, createdOrder1.info && createdOrder1.info.status);
    } catch (e) {
        console.log('createOrder failed:', e.message);
    }

    // createLimitOrder (auto-signed intent via createOrder)
    let createdOrder2
    try {
        createdOrder2 = await ex.createLimitOrder(symbol, 'buy', 0.001, 1, { leverage: 1, commit: true });
        console.log('createLimitOrder:', createdOrder2.id);
    } catch (e) {
        console.log('createLimitOrder failed:', e.message);
    }

    // cancelOrder (auto-signed intent): cancel the last created order if available
    try {
        if (createdOrder2 && createdOrder2.id) {
            const canceled = await ex.cancelOrder(createdOrder2.id, symbol, { commit: true });
            console.log('cancelOrder:', canceled.id, canceled.status);
        } else {
            console.log('cancelOrder skipped: no created order id');
        }
    } catch (e) {
        console.log('cancelOrder failed:', e.message);
    }

    // fetchOpenOrders
    try {
        const openOrders = await ex.fetchOpenOrders(symbol, undefined, 10);
        console.log('fetchOpenOrders:', openOrders.length);
    } catch (e) {
        console.log('fetchOpenOrders failed (requires auth):', e.message);
    }

    // fetchClosedOrders
    try {
        const closedOrders = await ex.fetchClosedOrders(symbol, undefined, 10);
        console.log('fetchClosedOrders:', closedOrders.length);
    } catch (e) {
        console.log('fetchClosedOrders failed (requires auth):', e.message);
    }

    // fetchOrder
    try {
        const order = await ex.fetchOrder(createdOrder1.id, symbol);
        console.log('fetchOrder:', order && order.id);
    } catch (e) {
        console.log('fetchOrder failed:', e.message);
    }

    // watchOrders (Pro)
    try {
        const orders = await ex.watchOrders(symbol);
        console.log('watchOrders received:', orders.length);
    } catch (e) {
        console.log('watchOrders failed:', e.message);
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
