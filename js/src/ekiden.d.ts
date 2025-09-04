import Exchange from './abstract/ekiden.js';
import type { Market, OHLCV, Order, Int, Ticker, Num, OrderSide, OrderType, Dict, Str, Trade, OrderBook, Balances, Tickers, Strings, Position } from './base/types.js';
/**
 * @class ekiden
 * @augments Exchange
 */
export default class ekiden extends Exchange {
    stripAddrSuffixUpper(value: string): string;
    normalizeSymbol(symbol: string): string;
    intentSeedHex(): string;
    serializeStringHex(value: string): string;
    private encodeUleb128Length;
    private fromDecimals;
    private applyPriceMultiplier;
    private parseTickerStats;
    private compute24hVolumesFromCandles;
    serializeActionPayloadHex(payload: Dict): string;
    buildMessageHex(payloadHex: string, nonce: number): string;
    signMessageHex(messageHex: string): string;
    buildSignedIntent(payload: Dict, nonce: number): Dict;
    isValidSignedIntentParams(params: Dict, expectedType?: string): boolean;
    scaleOrderFields(market: Market, side: OrderSide, amount: number, price: Num, type: OrderType, leverage: number): Dict;
    parseCancelOrderResult(response: Dict, requestedId: string, market?: Market): Order;
    parseCreateOrderResult(response: Dict, payload: Dict, market: Market, amount: number, price: Num, side: OrderSide, type: OrderType): Order;
    describe(): any;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    fetchBalance(params?: {}): Promise<Balances>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name ekiden#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of tickers indexed by market symbol
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    setLeverage(leverage: number, symbol?: Str, params?: {}): Promise<{
        info: any;
        symbol: string;
    }>;
}
