# Changelog

All notable changes are documented here. Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.6.0 — infra hardening + observability + skill eval harness

Mostly internal-quality improvements; no new commands. Backbone for everything that follows.

**New infra**
- **Background update-check** — silent detached subprocess polls the registry once/day; next-run prints `Update available: X.Y.Z → A.B.C`. Honors `NO_UPDATE_NOTIFIER` / `CI` / `VIKE_NO_UPDATE_CHECK`.
- **First-run-after-upgrade notice** — one-time `Updated to X.Y.Z` print.
- **Telemetry skeleton** — anonymous UUID + 30-min session ID, fire-and-forget. NO sink endpoint wired yet (events drop silently); shape is stable so we can flip it on without refactoring. Opt-out via `DO_NOT_TRACK=1` or `VIKE_NO_TELEMETRY=1`.
- **Centralized chain registry** (`src/chains.js`) — `ALL_CHAINS`, `EVM_CHAINS`, `WALLET_CHAINS`, `CHAIN_ALIASES`, `normaliseChain()`, `isEvmAddress()`.

**Testing + release safety**
- Two-tier vitest config — `npm test` (unit/integration, <30s) vs `npm run test:e2e` (live MCP, up to 2 min).
- Four meta-tests added: shebang, pack-and-install (catches missing `files`), CLI help for every command, command coverage regression.
- Pretest changeset validator — hard-fails on wrong package name in changeset frontmatter; warns on missing changeset.
- Postinstall script hardened — global-install + TTY gates, always `exit 0`.

**Skill quality evals (preview)**
- `evals/` directory with a `uv run`-script harness: A/B-tests every question against `vike --help` only vs `vike --help + SKILL.md`. Scores per question; aggregates a Δ for each skill. If a skill doesn't move the score, it shouldn't ship. Run: `uv run --script evals/runner.py` (needs `ANTHROPIC_API_KEY`).
- 14 starter questions in `evals/questions.yaml`.

**Security**
- `SECURITY.md` published (report at security@vike.io; 48h ack, 7d critical-fix SLA).
- `CODEOWNERS` file (single-maintainer for now; security-sensitive paths called out).
- Dependabot weekly PRs for npm + GitHub Actions deps.
- `npm audit --audit-level=high` added to CI.

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
