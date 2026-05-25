# Changelog

All notable changes are documented here. Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Changesets](https://github.com/changesets/changesets) to generate releases.

## 0.2.0 — Polymarket suite

- New command group `vike polymarket` (alias: `pm`) with 4 subcommands:
  - `markets` — trending Polymarket markets ranked by 24h volume, filterable by category
  - `market <condition_id>` — deep-dive on one market
  - `wallet <address>` — Polymarket trader profile (PnL / hit-rate / categories)
  - `smart-money` — cohort flows or mispricings detection
- 5 new SKILL.md playbooks: `vike-polymarket-markets`, `vike-polymarket-market-detail`, `vike-polymarket-trader`, `vike-polymarket-smart-money`, `vike-polymarket-screener` (composite).
- Total: 21 SKILL.md skills (was 16), 18 MCP tools backing the CLI (was 14).
- Backend: corresponding `polymarket_markets`, `polymarket_market_detail`, `polymarket_wallet`, `polymarket_smart_money` MCP tools deployed on the vike.io MCP server.

## 0.1.0 — initial release

- CLI surface for 14 vike.io MCP tools: `token search/transfers/chart`, `wallet summary/discover`, `perp funding/spreads/top-traders`, `options flow`, `alerts list/channels/create/edit/delete`.
- Auth via env var (`VIKE_API_KEY`), saved config (`~/.vike/config.json`), or interactive `vike init`.
- `vike doctor` for setup diagnostics.
- `vike schema --pretty` for full command/flag reference (auto-discovered from MCP `tools/list`).
- 16 SKILL.md playbooks under `skills/` for AI-agent discovery (Claude Code, OpenClaw, Cursor).
- Pretty table output by default; `--json` or piped output emits JSON.
