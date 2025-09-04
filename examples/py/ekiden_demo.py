import sys
import time

import ccxt


def main():
    ex = ccxt.ekiden({
        'apiKey': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIweGIwYWYyMjI3Zjc0YWNiNzBmNDI0NzViMzVhMjMxMjcyNGY1NjExY2MzZmI0YWQxYzhkNmYzMWQxZDBhOGIyMDciLCJpYXQiOjE3NTY4OTU3ODAsImV4cCI6MTc1NzUwMDU4MCwicHVibGljX2tleSI6IjB4MDQ4NTY0MWI4N2ZiZGEyNjMyN2Q4MGYwMjlmNzQwNTgxODY2NjU0MzEzZWVlYzljNWJiOGYyOWRmY2JiNTljYyIsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtdXNlci1pZCI6IjB4YjBhZjIyMjdmNzRhY2I3MGY0MjQ3NWIzNWEyMzEyNzI0ZjU2MTFjYzNmYjRhZDFjOGQ2ZjMxZDFkMGE4YjIwNyIsIngtaGFzdXJhLXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciJdfX0.jUx1nQH_YzzgDOOITZxvFmu0ayQuBE4qDus40zX99IE",
        'secret': "0x1f6bdaeb6cd4e89f43eeddeaae7525ec5797d7f304b00005bd005ec7e4c49fc9"
    })

    print('Loading markets...')
    markets = ex.load_markets()
    symbols = list(markets.keys())
    if not symbols:
        print('No markets available')
        return
    # Prefer HYPE/USDC if available for parity with OctoBot error
    preferred = 'HYPE/USDC'
    symbol = preferred if preferred in symbols else symbols[0]
    print('Using symbol:', symbol)

    # fetchTicker (under the hood calls v1PublicGetMarketCandlesStatsMarketAddr)
    try:
        ticker = ex.fetch_ticker(symbol)
        print('fetchTicker:', {
            'last': ticker.get('last'),
            'high': ticker.get('high'),
            'low': ticker.get('low'),
            'baseVolume': ticker.get('baseVolume'),
            'quoteVolume': ticker.get('quoteVolume'),
        })
    except Exception as e:
        print('fetchTicker failed:', str(e))

    # Raw stats endpoint called by fetch_ticker
    try:
        market = ex.market(symbol)
        raw_stats = ex.v1PublicGetMarketCandlesStatsMarketAddr({'market_addr': market['id']})
        print('raw stats:', raw_stats)
    except Exception as e:
        print('raw stats failed:', str(e))

    # Compute 24h volume from 1m candles (same logic as ccxt fallback)
    try:
        since = ex.milliseconds() - 24 * 60 * 60 * 1000
        ohlcv = ex.fetch_ohlcv(symbol, '1m', since, 1440)
        base_sum = 0
        quote_sum = 0
        for c in ohlcv:
            ts, o, h, l, c_close, v = c
            if v and c_close:
                base_sum += v
                quote_sum += v * c_close
        print('computed 24h from candles:', {'baseVolume': base_sum, 'quoteVolume': quote_sum, 'candles': len(ohlcv)})
    except Exception as e:
        print('compute from candles failed:', str(e))

    # fetchOHLCV
    try:
        ohlcv = ex.fetch_ohlcv(symbol, '1h', None, 5)
        print('fetchOHLCV length:', len(ohlcv), 'first:', ohlcv[0] if ohlcv else None)
    except Exception as e:
        print('fetchOHLCV failed:', str(e))

    # fetchOrderBook
    try:
        ob = ex.fetch_order_book(symbol, 10)
        bids = ob.get('bids') if isinstance(ob, dict) else None
        asks = ob.get('asks') if isinstance(ob, dict) else None
        top_bid = bids[0] if isinstance(bids, list) and len(bids) > 0 else None
        top_ask = asks[0] if isinstance(asks, list) and len(asks) > 0 else None
        print('fetchOrderBook top:', {'bid': top_bid, 'ask': top_ask})
    except Exception as e:
        print('fetchOrderBook failed:', str(e))

    # fetchTrades
    try:
        trades = ex.fetch_trades(symbol, None, 5)
        print('fetchTrades length:', len(trades))
    except Exception as e:
        print('fetchTrades failed:', str(e))

    # fetchBalance (requires apiKey)
    try:
        balances = ex.fetch_balance()
        codes = [k for k in balances.keys() if k not in ['info', 'timestamp', 'datetime', 'free', 'used', 'total']]
        if codes:
            code = codes[0]
            b = balances.get(code, {})
            print('fetchBalance:', code, {'free': b.get('free'), 'used': b.get('used'), 'total': b.get('total')})
        else:
            print('fetchBalance: no balances')
    except Exception as e:
        print('fetchBalance failed (requires auth):', str(e))

    # createOrder (auto-signed intent)
    created_order1 = None
    try:
        created_order1 = ex.create_order(symbol, 'limit', 'buy', 0.001, 1, { 'leverage': 1, 'commit': True })
        info = (created_order1 or {}).get('info') or {}
        print('createOrder:', (created_order1 or {}).get('id'), info.get('status'))
    except Exception as e:
        print('createOrder failed:', str(e))

    # createLimitOrder (auto-signed intent via create_order)
    created_order2 = None
    try:
        created_order2 = ex.create_limit_order(symbol, 'buy', 0.001, 1, { 'leverage': 1, 'commit': True })
        print('createLimitOrder:', (created_order2 or {}).get('id'))
    except Exception as e:
        print('createLimitOrder failed:', str(e))

    # cancelOrder (auto-signed intent): cancel the last created order if available
    try:
        if created_order2 and created_order2.get('id'):
            canceled = ex.cancel_order(created_order2.get('id'), symbol, { 'commit': True })
            print('cancelOrder:', canceled.get('id'), canceled.get('status'))
        else:
            print('cancelOrder skipped: no created order id')
    except Exception as e:
        print('cancelOrder failed:', str(e))

    # fetchOpenOrders
    try:
        open_orders = ex.fetch_open_orders(symbol, None, 10)
        print('fetchOpenOrders:', len(open_orders))
    except Exception as e:
        print('fetchOpenOrders failed (requires auth):', str(e))

    # fetchClosedOrders
    try:
        closed_orders = ex.fetch_closed_orders(symbol, None, 10)
        print('fetchClosedOrders:', len(closed_orders))
    except Exception as e:
        print('fetchClosedOrders failed (requires auth):', str(e))

    # fetchOrder
    try:
        if created_order1 and created_order1.get('id'):
            order = ex.fetch_order(created_order1.get('id'), symbol)
            print('fetchOrder:', order and order.get('id'))
        else:
            print('fetchOrder skipped: no created order id')
    except Exception as e:
        print('fetchOrder failed:', str(e))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('Unexpected error:', str(e))
        sys.exit(1)

