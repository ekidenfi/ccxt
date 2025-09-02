import ekidenRest from '../ekiden.js';
import { Int, Str, OHLCV, Order } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class ekiden extends ekidenRest {
    describe(): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrdersLoop(client: Client, messageHash: string, market?: any, params?: {}): Promise<void>;
    handleMessage(client: Client, message: any): void;
    handleTradesForOHLCV(client: Client, message: any): void;
    appendOHLCVFromTrade(symbol: string, timeframe: string, timestamp: number, price: number, amount: number): void;
}
