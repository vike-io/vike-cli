# Changelog

All notable changes are documented here. Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Changesets](https://github.com/changesets/changesets) to generate releases.

## 0.1.0 — initial release

- CLI surface for 14 vike.io MCP tools: `token search/transfers/chart`, `wallet summary/discover`, `perp funding/spreads/top-traders`, `options flow`, `alerts list/channels/create/edit/delete`.
- Auth via env var (`VIKE_API_KEY`), saved config (`~/.vike/config.json`), or interactive `vike init`.
- `vike doctor` for setup diagnostics.
- `vike schema --pretty` for full command/flag reference (auto-discovered from MCP `tools/list`).
- 16 SKILL.md playbooks under `skills/` for AI-agent discovery (Claude Code, OpenClaw, Cursor).
- Pretty table output by default; `--json` or piped output emits JSON.
