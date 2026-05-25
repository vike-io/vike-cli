---
name: vike-fund-holdings
description: Top labeled fund / market-maker / treasury / CEX wallets ranked by recent net inflow USD. Use when the user asks "what are funds buying" / "which whales are accumulating" / "track institutional flows".
allowed-tools: Bash(vike:*)
---

# vike-fund-holdings

## Command

```bash
vike funds [--kind funds|cex|mm|treasury] [--window 7d|30d|90d|180d|all] [--limit N] [--json]
```

## Examples

```bash
vike funds --kind funds --window 30d --limit 10
vike funds --kind cex --window 7d --limit 20
vike funds --kind treasury --window 90d
vike funds --kind mm --window 30d
```

## Kind filters

| Kind | Includes |
|---|---|
| `funds` (default) | Treasury wallets + market-makers + custody anchors + Arkham-tagged Fund/Hedge/VC/Foundation/DAO |
| `cex` | Exchanges (Binance, Coinbase, Bybit, OKX, etc.) |
| `mm` | Market-makers (Wintermute, GSR, Jump, etc.) |
| `treasury` | DAO + corporate treasury wallets |

## Output columns

`wallet`, `entity`, `arkham_label`, `wallet_type`, `confidence`, `net_flow_usd` (window), `volume_usd` (window), `tx_count` (window)

## Reading

- **Sort is descending by net_flow_usd** — top accumulators come first
- A wallet with `entity = "Binance"` and `wallet_type = "cex"` showing massive net inflow = users depositing TO Binance (bearish for prices on the way in), or Binance moving inventory internally
- `confidence = "High"` rows have multi-source label agreement; `Low` rows are heuristic-only
- Negative `net_flow_usd` in a list sorted descending = no accumulators above this row; everyone is net-selling

## Anti-patterns

- Don't quote "Binance bought $50M of X" from this view — it's wallet-level flow, not per-token attribution. For per-token, use `vike token holders` then filter for CEX labels.
- Treasury wallets often have huge one-time inflows (e.g. ICO unlocks); a single 30d window can be misleading. Check `--window all` for context.

## Pairs well with

- `vike labels <addr>` — drill into any specific wallet's full label cascade
- `vike token holders <addr>` — see which of these wallets hold a specific token
- `vike-smart-money-discovery` — find unlabeled smart wallets vs labeled funds
