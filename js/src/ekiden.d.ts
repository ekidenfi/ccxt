import Exchange from './abstract/ekiden.js';
import type { Market, OHLCV, Order, Int, Ticker, Num, OrderSide, OrderType, Dict, Str, Trade, OrderBook, Balances } from './base/types.js';
/**
 * @class ekiden
 * @augments Exchange
 */
export default class ekiden extends Exchange {
    protected intentSeed(): Uint8Array;
    protected encodeUleb128(value: number): Uint8Array;
    protected encodeU64LE(value: number | bigint): Uint8Array;
    protected concatBytes(arrays: Uint8Array[]): Uint8Array;
    protected serializeString(value: string): Uint8Array;
    protected serializeActionPayload(payload: Dict): Uint8Array;
    protected buildMessage(payloadBytes: Uint8Array, nonce: number): Uint8Array;
    protected bytesToHex(arr: Uint8Array): string;
    protected signMessage(message: Uint8Array): string;
    protected buildSignedIntent(payload: Dict, nonce: number): Dict;
    protected isValidSignedIntentParams(params: Dict, expectedType?: string): boolean;
    protected scaleOrderFields(market: Market, side: OrderSide, amount: number, price: Num, type: OrderType, leverage: number): Dict;
    protected parseCancelOrderResult(response: Dict, requestedId: string, market?: Market): Order;
    protected parseCreateOrderResult(response: Dict, payload: Dict, market: Market, amount: number, price: Num, side: OrderSide, type: OrderType): Order;
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
    fetchBalance(params?: {}): Promise<Balances>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
}
