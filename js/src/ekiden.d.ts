import Exchange from './abstract/ekiden.js';
import type { Market, OHLCV, Order, Int, Ticker, Num, OrderSide, OrderType, Dict, Str, Trade, OrderBook, Balances } from './base/types.js';
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
