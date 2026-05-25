# Changelog

All notable changes are documented here. Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.5.0 — initial public release

AI-agent CLI for vike.io on-chain analytics, perpetuals, options flow, and prediction-market data across 11 chains.

**15 command groups, 29 backing MCP tools, 33 SKILL.md playbooks** for Claude Code, OpenClaw, Cursor, GitHub Copilot, and other agent runtimes.

```
vike token   search | transfers | chart | holders
vike wallet  summary | discover | counterparties | pnl-history | balances | ens
vike perp    funding | spreads | top-traders
vike options flow
vike polymarket markets | market | wallet | smart-money
vike funds | labels | defi
vike web     search | fetch
vike alerts  list | channels | create | edit | delete | register-webhook
vike init | doctor | schema | whoami | login | logout
```

Skill discovery: agents auto-discover skills from the `skills/` folder. Manual install: `npx skills add vike-io/vike-cli`.
