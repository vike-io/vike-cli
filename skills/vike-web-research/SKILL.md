---
name: vike-web-research
description: Multi-step web research playbook — search → fetch the most relevant URL → synthesize answer. Use when the user asks an open question that requires fresh web info ("what did Trump say about crypto yesterday", "latest exchange listing announcement", "summarize the latest Pendle update").
allowed-tools: Bash(vike:*)
---

# vike-web-research

Composite playbook combining `vike web search` and `vike web fetch` for cross-source synthesis.

## Workflow

### 1. Search (gather candidate URLs)

```bash
vike web search "<query>" --max 5 --json
```

Capture the top results' URLs and titles. If the response includes an `answer` field, that's often enough for simple factual queries — surface it directly and skip step 2.

### 2. Fetch (only when search snippets are insufficient)

```bash
vike web fetch <top-result-url> --ask "<focused question>" --json
```

Fetch only the highest-scoring (Tavily) or most-credible (Serper) URL. Re-fetching all 5 search results burns credits and adds noise.

### 3. Synthesize

> **Question:** `<user query>`
> **Answer (from `<source URL>`):** `<extracted answer>`
> **Other relevant sources:** `<url1>`, `<url2>` (with one-line summaries each)

Always link the source URL so the user can verify.

## When to skip the workflow

- **One-shot fact lookup** (price, date, contract address) → if `web search` returns it in the `answer` field, just quote that
- **The user already gave you a URL** → skip search, jump to `web fetch`
- **On-chain question** → don't web-research; use vike's on-chain tools (`token holders`, `wallet labels`, `perp funding`, etc.)

## Anti-patterns

- Don't fetch 5 URLs and average them — pick the most authoritative
- Don't quote Reddit / Twitter as primary sources for hard claims (price, dates, addresses); use them for sentiment only
- Don't combine web research with `vike-smart-money-discovery` results without saying so — they're different evidence types

## Cost

- Step 1: 2 credits (Tavily basic)
- Step 2: 3 credits (web_fetch with --ask = Tavily extract + Cerebras Q&A)
- Total: ~5 credits per research round

## Pairs well with

- `vike-token-research` — combine on-chain data with off-chain news
- `vike-polymarket-screener` — narrative-driven prediction markets often need news context
