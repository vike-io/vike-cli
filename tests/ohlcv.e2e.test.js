// Live e2e smoke test for `vike ohlcv`. Hits the real MCP at vike.io.
// Runs only via `npm run test:e2e`, and only when a VIKE_API_KEY is
// available (loaded from .env by vitest.e2e.config.js, or exported in the
// shell). Skips cleanly otherwise so a keyless CI run stays green.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(__dirname, '..', 'src', 'index.js');
const hasKey = Boolean(process.env.VIKE_API_KEY);
// `it`/`it.skip` instead of `it.skipIf` — the latter is brittle across vitest
// versions; this skips just as cleanly when no key is configured.
const maybeIt = hasKey ? it : it.skip;

function runJson(args) {
  const out = execFileSync(process.execPath, [ENTRY, ...args], {
    encoding: 'utf8',
    env: { ...process.env, VIKE_NO_TELEMETRY: '1', VIKE_NO_UPDATE_CHECK: '1' },
  });
  return JSON.parse(out);
}

describe('vike ohlcv (live)', () => {
  maybeIt('returns closed candles for BTC', () => {
    const r = runJson(['ohlcv', 'BTC', '--interval', '1h', '--limit', '2', '--json']);
    expect(r.symbol).toBe('BTC');
    expect(Array.isArray(r.candles)).toBe(true);
    expect(r.candles.length).toBeGreaterThan(0);
    const c = r.candles[0];
    for (const k of ['ts', 'open', 'high', 'low', 'close', 'volume']) {
      expect(typeof c[k]).toBe('number');
    }
    // High is the max of the candle; sanity-check OHLC ordering.
    expect(c.high).toBeGreaterThanOrEqual(c.low);
  });

  maybeIt('honours --market perp', () => {
    const r = runJson(['ohlcv', 'ETH', '--interval', '4h', '--market', 'perp', '--limit', '1', '--json']);
    expect(r.market).toBe('perp');
    expect(r.pair).toMatch(/PERP/);
  });
});
