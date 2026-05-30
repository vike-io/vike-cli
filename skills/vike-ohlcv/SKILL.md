---
name: vike-ohlcv
description: Historical CEX candles for a canonical ticker (BTC) or exchange pair (BTCUSDT) at any timeframe (1m–1w), spot or perp. Use when the user asks "BTC hourly candles" / "ETH 4h chart on Binance" / "give me daily OHLCV for SOL" / needs look-ahead-safe candle data for a backtest.
allowed-tools: Bash(vike:*)
---

# vike-ohlcv

CEX OHLCV candles by ticker or pair. Distinct from `vike token chart`, which serves DEX candles by **contract address** at only 5/30/120-min resolution.

## Command

```bash
vike ohlcv <symbol> [--interval 1m|3m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|1w] \
                    [--exchange binance|bybit|okx|gate|kucoin|coinbase|mexc|pyth] \
                    [--market spot|perp] [--start <ts>] [--end <ts>] \
                    [--limit N] [--cursor <c>] [--json]
```

- `<symbol>` — canonical ticker (`BTC`, `ETH`) or an exchange pair (`BTCUSDT`, `BTCUSDT_PERP`).
- `--exchange` — **omit for the merged best-source series** (best venue per minute, gaps backfilled). Pin a venue only for that venue's raw series.
- `--interval` defaults to `1h`. `--market` defaults to `spot`.
- `--start` / `--end` — ISO-8601 UTC (`2026-01-01`) or epoch ms. Buckets are left-aligned UTC.
- `--limit` defaults to 500, hard max 5000.

## Examples

```bash
# Last 500 hourly candles, merged best-source:
vike ohlcv BTC --json

# 4h Binance perp candles for ETH:
vike ohlcv ETH --interval 4h --market perp --exchange binance --json

# Daily candles over an explicit range:
vike ohlcv SOL --interval 1d --start 2026-01-01 --end 2026-03-01 --json

# Page forward with the cursor from a previous call:
vike ohlcv BTC --interval 1m --limit 5000 --cursor <next_cursor> --json
```

## Output

`{ symbol, pair, exchange, interval, market, tz, candles[], next_cursor }`

Each candle: `{ ts (epoch ms, UTC), open, high, low, close, volume }`, ascending by `ts`.

## Reading

- **Look-ahead-safe**: the in-progress (partial) bucket is excluded, so the last candle is always closed — safe to feed into a backtest.
- `exchange: "merged"` means no `--exchange` was pinned; each minute is sourced from the best available venue with gaps backfilled.
- `pair` echoes how the symbol resolved — `BTCUSDT` for spot, `BTCUSDT_PERP` for perp.
- Use `next_cursor` to page; pass it back via `--cursor`. A null/absent cursor means the series is exhausted.

## Anti-patterns

- Don't use this for an on-chain/DEX-only token with no CEX listing — use `vike token chart <contract_address>` instead.
- Don't omit `--market perp` when the user clearly means a perpetual; spot and perp candles differ.
- Don't request 1m candles over a multi-month range in one call — page with `--cursor` (hard max 5000 candles/call).

## Pairs well with

- `vike token chart <addr>` — DEX candles when there's no CEX pair
- `vike perp funding` / `vike perp spreads` — pair candle context with funding/spread arb
- `vike options flow` — overlay options positioning on the underlying's candles
