---
name: vike-defi-positions
description: DeFi protocol positions for a wallet across all DeBank-supported chains (Aave, Uniswap LP, Curve, Pendle, EigenLayer, etc.) — net USD, asset USD, debt USD per protocol. Use when the user asks "what DeFi positions does this wallet have" / "is wallet X farming yields" / "show me the protocol breakdown for Y".
allowed-tools: Bash(vike:*)
---

# vike-defi-positions

## Command

```bash
vike defi <address> [--json]
```

## Example

```bash
vike defi 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045   # vitalik.eth
```

## Output shape

```json
{
  "address": "0x...",
  "total_balance": {
    "total_usd": 12345.67,
    "chains": [
      { "chain": "eth",    "usd": 9000.00 },
      { "chain": "arb",    "usd": 2000.00 },
      { "chain": "base",   "usd": 1345.67 }
    ]
  },
  "protocols": [
    { "protocol": "Aave V3",      "chain": "eth",  "net_usd": 5000.00, "asset_usd": 8000.00, "debt_usd": 3000.00, "positions": 2 },
    { "protocol": "Uniswap V3",   "chain": "eth",  "net_usd": 2500.00, "asset_usd": 2500.00, "debt_usd": 0.00,    "positions": 4 },
    ...
  ]
}
```

## Reading

- `net_usd = asset_usd - debt_usd` — what the position is actually worth
- A protocol row with `debt_usd > 0` means the wallet is **borrowing** (Aave / Compound / Morpho). High debt + low asset = leveraged.
- `positions` count tells you how many active positions inside one protocol (e.g. 4 Uniswap LP positions)
- `total_balance.total_usd` includes both DeFi positions AND wallet token balances; the `protocols` array is DeFi-only

## Anti-patterns

- DeBank may not cover every L2/protocol — a missing protocol doesn't mean the wallet has no position there
- The `chain` field uses DeBank's IDs (`eth`, `bsc`, `matic`, `arb`, `op`, `base`, etc.) — translate to user-friendly names when reporting
- Stale data: DeBank refresh varies; freshly-opened positions may not show for 5-15 min
- If you get `balance_error` or `positions_error`, the DeBank API is rate-limited / down — retry once, then surface the error honestly

## Pairs well with

- `vike labels <addr>` — combine label provenance with DeFi positions for a full institutional view
- `vike wallet summary <addr>` — on-chain transfer activity vs DeFi positions for the same wallet
