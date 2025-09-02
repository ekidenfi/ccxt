import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    v1PublicGetMarketCandles(params?: {}): Promise<implicitReturnType>;
    v1PublicGetMarketCandlesStatsMarketAddr(params?: {}): Promise<implicitReturnType>;
    v1PublicGetMarketMarketInfo(params?: {}): Promise<implicitReturnType>;
    v1PublicGetMarketFills(params?: {}): Promise<implicitReturnType>;
    v1PublicGetMarketOrders(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetUserOrders(params?: {}): Promise<implicitReturnType>;
    v1PrivatePostUserIntent(params?: {}): Promise<implicitReturnType>;
    v1PrivatePostUserIntentCommit(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
