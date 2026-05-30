---
"@vike-io/cli": minor
---

Add `vike ohlcv <symbol>` — historical CEX candles for a canonical ticker (BTC) or exchange pair (BTCUSDT) across any timeframe (1m–1w). Supports `--interval`, `--exchange` (binance/bybit/okx/gate/kucoin/coinbase/mexc/pyth, or omit for merged best-source), `--market spot|perp`, `--start`/`--end`, `--limit` (max 5000), and `--cursor` paging. Distinct from `vike token chart`, which serves DEX candles by contract address.
