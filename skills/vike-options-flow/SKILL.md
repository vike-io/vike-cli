---
name: vike-options-flow
description: Deribit options flow — call/put volume, put-call ratios, and direction signals for BTC / ETH / SOL. Use when the user asks "options flow on X" / "put call ratio" / "options positioning".
allowed-tools: Bash(vike:*)
---

# vike-options-flow

## Command

```bash
vike options flow --symbol BTC|ETH|SOL [--window 1d|1w|1m] [--json]
```

Default: BTC, 1d.

## Output

Per-window aggregates: call volume, put volume, put-call ratio, net delta, open-interest deltas.

## Reading the put-call ratio (PCR)

| PCR (volume basis) | Read |
|---|---|
| < 0.5 | **Aggressive call buying** — bullish positioning, or call-overwrite unwind |
| 0.5–0.8 | Normal bullish |
| 0.8–1.2 | Balanced |
| 1.2–1.8 | Bearish hedging or directional put buying |
| > 1.8 | Heavy put demand — fear / hedge spike |

PCR is **not a contrarian signal** on its own. Cross-reference with spot price action and funding:
- High PCR + price falling + negative funding = real bearish capitulation
- High PCR + price flat + positive funding = hedging into a rally (not panic)

## Window choice

- `1d` — intraday sentiment shifts, useful around major events
- `1w` — positioning trend; cleaner read for narrative
- `1m` — structural positioning; useful for IV-rank and term-structure context

## Anti-patterns

- Don't quote raw call/put volume without context — Deribit's BTC notional is in the tens of billions weekly; a $100M day means little in isolation.
- Don't conflate flow (new positions) with open interest (cumulative). Flow is the change; OI is the stock.

## Pairs well with

- `vike-perp-funding-arb` for the corresponding perp positioning
- `vike-perp-screener` for the broader market read
