from ccxt.base.types import Entry


class ImplicitAPI:
    v1_public_get_market_candles = v1PublicGetMarketCandles = Entry('market/candles', ['v1', 'public'], 'GET', {'cost': 1})
    v1_public_get_market_candles_stats_market_addr = v1PublicGetMarketCandlesStatsMarketAddr = Entry('market/candles/stats/{market_addr}', ['v1', 'public'], 'GET', {'cost': 1})
    v1_public_get_market_market_info = v1PublicGetMarketMarketInfo = Entry('market/market_info', ['v1', 'public'], 'GET', {'cost': 1})
    v1_public_get_market_fills = v1PublicGetMarketFills = Entry('market/fills', ['v1', 'public'], 'GET', {'cost': 1})
    v1_public_get_market_orders = v1PublicGetMarketOrders = Entry('market/orders', ['v1', 'public'], 'GET', {'cost': 1})
    v1_private_get_user_orders = v1PrivateGetUserOrders = Entry('user/orders', ['v1', 'private'], 'GET', {'cost': 1})
    v1_private_post_user_intent = v1PrivatePostUserIntent = Entry('user/intent', ['v1', 'private'], 'POST', {'cost': 1})
    v1_private_post_user_intent_commit = v1PrivatePostUserIntentCommit = Entry('user/intent/commit', ['v1', 'private'], 'POST', {'cost': 1})
