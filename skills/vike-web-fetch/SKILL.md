---
name: vike-web-fetch
description: Fetch a URL's content (via Tavily extract) and optionally answer a question about it using Cerebras Llama 3.3 70B. Use when the user gives a URL and asks "what does this page say" / "summarise X" / "extract Y from this article".
allowed-tools: Bash(vike:*)
---

# vike-web-fetch

## Command

```bash
vike web fetch <url> [--ask "<question>"] [--json]
```

## Examples

```bash
vike web fetch https://example.com/article
vike web fetch https://example.com/article --ask "what's the launch date?"
vike web fetch https://docs.hyperliquid.xyz/funding --ask "how often does funding settle?"
```

## Output

```json
{
  "url": "https://...",
  "content_length": 12345,
  "content": "First 8K chars of extracted content...",
  "answer": "Answer to your question if --ask was provided"
}
```

If `--ask` is omitted, you get raw extracted content only.

## How it works

1. Tries Tavily's `/extract` endpoint first — returns clean markdown-like text
2. Falls back to raw HTTP GET if Tavily extract is unavailable
3. If `--ask` is provided, sends content + question to Cerebras Llama 3.3 70B for a focused answer

## Why we use Cerebras (not Gemini / OpenAI)

Cerebras Llama 3.3 70B is ~10x cheaper than Gemini 2.5 Flash and ~3-5x faster (1000+ tok/sec inference). Same answer quality for short Q&A on supplied content.

## Anti-patterns

- Don't fetch pay-walled URLs and expect text — you'll get a paywall page. Cite the URL and tell the user instead.
- Don't fetch huge files (PDFs > 10MB, videos) — the extract will be truncated and likely garbage.
- Don't ask `--ask` questions the content can't possibly answer — Cerebras will hallucinate. Stay tight to what's on the page.

## Pairs well with

- `vike web search` — find URLs to fetch first
- `vike-web-research` — composite multi-step research workflow
