# vike-cli

[![npm version](https://img.shields.io/npm/v/vike-cli.svg)](https://www.npmjs.com/package/vike-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

> **Command-line interface for the [vike.io](https://vike.io) API.** On-chain analytics, perpetuals, options flow, and prediction-market data across 11 chains — designed to be driven by AI agents (Claude Code, OpenClaw) as well as humans.

## Install

```bash
npm install -g vike-cli
```

## Quick start

```bash
vike init                      # interactive: paste API key, verify connection
vike doctor                    # confirm everything works
vike token search BTC          # your first query
```

Get an API key at [vike.io/api/keys](https://vike.io/api/keys).

## Commands at a glance

```
vike token   search | transfers | chart
vike wallet  summary | discover
vike perp    funding | spreads | top-traders
vike options flow
vike alerts  list | channels | create | edit | delete
vike init | doctor | schema | whoami | login | logout
```

Run `vike schema --pretty` for the full command + flag reference.

## What it does

| Domain | What you can ask |
|---|---|
| **Tokens** | Resolve symbols → addresses, see top buyers/sellers, pull OHLCV |
| **Wallets** | Aggregate metrics per wallet, leaderboards by volume / PnL / netflow |
| **Perps** | Funding rates + cross-venue spreads across Binance / Bybit / OKX / Aster / Hyperliquid |
| **Hyperliquid** | Top-trader leaderboard with PnL / ROI / win-rate filters |
| **Options** | Deribit flow for BTC / ETH / SOL with put-call ratios |
| **Alerts** | Create transfer alerts; deliver to email or Discord |

## For AI agents

This package ships **skill playbooks** under [`skills/`](skills/) — markdown files designed to be loaded by AI coding agents (Claude Code, OpenClaw, Cursor) so they know when and how to invoke each command.

Skill entry points:
- `vike-core` — install + auth + conventions (read first)
- `vike-router` — decide which skill applies
- `vike-token-research`, `vike-smart-money-discovery`, `vike-perp-funding-arb`, `vike-perp-screener`, `vike-hl-top-traders`, `vike-hl-trader-profile`, `vike-cross-venue-perps`, `vike-options-flow`, `vike-alerts-setup` — task playbooks
- Per-tool skills for each command

In Claude Code, the bundled skills are auto-discovered after `npm install -g vike-cli`. In other harnesses, point the agent at the `skills/` folder of this package.

## Auth

Three ways to provide your key, in order of precedence:

```bash
export VIKE_API_KEY=vk_...     # env (wins over everything)
vike login --api-key vk_...    # saved to ~/.vike/config.json
vike init                      # interactive
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `VIKE_API_KEY` | — | API key (overrides saved config) |
| `VIKE_MCP_URL` | `https://vike.io/mcp` | MCP endpoint (override for staging/local) |

## Output formatting

By default, table output for humans (TTY) and JSON when piped:

```bash
vike token search BTC                  # pretty table
vike token search BTC --json           # JSON
vike token search BTC | jq '.'         # auto-JSON when piped
```

## License

MIT — see [LICENSE](LICENSE).

## Links

- Homepage: [vike.io](https://vike.io)
- Issues: [github.com/vike-io/vike-cli/issues](https://github.com/vike-io/vike-cli/issues)
- API docs: [vike.io/api](https://vike.io/api)
