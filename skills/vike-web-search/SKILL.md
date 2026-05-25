---
name: vike-web-search
description: Web search using Tavily (LLM-tuned snippets, primary) with Serper Google fallback. Use when you need current events, project announcements, exchange listing news, or anything not in the vike on-chain databases.
allowed-tools: Bash(vike:*)
---

# vike-web-search

## Command

```bash
vike web search "<query>" [--max N] [--depth basic|advanced] [--json]
```

The query can contain multiple words (no quoting required if you don't have shell-special chars).

## Examples

```bash
vike web search "hyperliquid funding rate explained"
vike web search "polymarket trump 2026 latest" --max 8
vike web search "ETH ETF inflows last week" --depth advanced
```

## Output

```json
{
  "provider": "tavily",
  "query": "...",
  "answer": "Optional one-paragraph synthesised answer (Tavily only)",
  "results": [
    { "title": "...", "url": "...", "snippet": "...", "score": 0.88 },
    ...
  ]
}
```

`score` is a 0-1 relevance from Tavily (higher = more relevant). Serper doesn't include it.

## When to use vs on-chain tools

- **News / sentiment / project context** → `vike web search`
- **On-chain flows / wallet activity / token prices** → use the dedicated `vike token`/`vike wallet`/`vike perp` tools first
- **"What did X tweet" / "did Binance announce Y"** → web search

## Cost note

Web search calls cost 2 credits + an external API fee on our side. Use it when you genuinely need fresh / non-onchain info, not as a first-resort.

## Anti-patterns

- Don't web-search for things our on-chain tools answer faster ("top wallets holding PEPE" → `vike token holders` is faster, cheaper, and more accurate)
- Don't request `--max > 5` unless you genuinely need a wide net — agents waste tokens summarising 10 results when 3 would do
- `--depth advanced` doubles the cost; reserve for hard-to-answer queries

## Pairs well with

- `vike-web-fetch` — once you have a promising URL, fetch its full content
- `vike-web-research` — composite playbook for multi-step research
