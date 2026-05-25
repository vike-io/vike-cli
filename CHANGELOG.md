# Changelog

All notable changes are documented here. Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Changesets](https://github.com/changesets/changesets) to generate releases.

## 0.4.0 — web search + fetch (Tavily + Serper + Cerebras)

- `vike web search "<query>"` — web search with Tavily-first (LLM-tuned snippets + relevance scores) and Serper Google fallback.
- `vike web fetch <url> [--ask "<question>"]` — fetch URL via Tavily extract, optionally answer a question using Cerebras Llama 3.3 70B (~10x cheaper than Gemini Flash).
- 3 new SKILL.md playbooks: `vike-web-search`, `vike-web-fetch`, `vike-web-research` (multi-step composite).
- Total: 28 SKILL.md skills (was 25), 24 MCP tools (was 22).

## 0.3.0 — wallet labels + holders + DeFi positions

- `vike labels <address>` — multi-source label cascade for a wallet (Arkham + OLI + Blockscout + Dune + MEW darklist + Etherscan + heuristic classifier with per-source attribution + consensus view). **Headline differentiator: every label shows its evidence chain.**
- `vike funds [--kind funds|cex|mm|treasury]` — top labeled fund / market-maker / treasury / CEX wallets ranked by recent net inflow USD.
- `vike token holders <token_address>` — top ERC-20 holders by cumulative net inflow USD with labels joined in.
- `vike defi <address>` — DeFi protocol positions across all DeBank-supported chains (Aave, Uniswap LP, Curve, Pendle, etc.) with per-protocol net/asset/debt USD.
- 4 new SKILL.md playbooks: `vike-wallet-label-provenance`, `vike-fund-holdings`, `vike-token-holders`, `vike-defi-positions`.
- Total: 25 SKILL.md skills (was 21), 22 MCP tools (was 18).

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
