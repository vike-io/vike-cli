// Anonymous, opt-out telemetry skeleton.
//
// Design decisions:
// - Honors DO_NOT_TRACK=1 (industry standard) AND VIKE_NO_TELEMETRY=1
// - Honors CI / NODE_ENV=test (never phones home from CI)
// - Persistent UUIDv4 in ~/.vike/telemetry-id (regenerated on delete)
// - Rolling 30-min session ID — same session_id within a 30-min window
// - AbortController + 1000ms timeout, timer.unref() so we can't keep
//   the process alive
// - Payload includes: flag NAMES (no values), latency, success/error_code,
//   chain (if relevant). NEVER the actual data the user queried.
// - Fire-and-forget: errors are swallowed
//
// THE SINK IS NOT YET WIRED. `_send()` is a no-op until we have an
// endpoint. Keeping the API shape stable now so we can flip the switch
// later without a refactor.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const CONFIG_DIR = join(homedir(), '.vike');
const ID_FILE = join(CONFIG_DIR, 'telemetry-id');
const SESSION_FILE = join(CONFIG_DIR, 'session');
const SESSION_TTL_MS = 30 * 60 * 1000;
const ENDPOINT = process.env.VIKE_TELEMETRY_ENDPOINT || '';
const REQUEST_TIMEOUT_MS = 1000;

function disabled() {
  return process.env.DO_NOT_TRACK === '1' ||
         process.env.VIKE_NO_TELEMETRY === '1' ||
         process.env.CI ||
         process.env.NODE_ENV === 'test';
}

function ensureDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function getDeviceId() {
  try {
    if (existsSync(ID_FILE)) return readFileSync(ID_FILE, 'utf8').trim();
  } catch { /* ignore */ }
  const id = randomUUID();
  try { ensureDir(); writeFileSync(ID_FILE, id, { mode: 0o600 }); } catch { /* ignore */ }
  return id;
}

function getSessionId() {
  let prev = null;
  try {
    if (existsSync(SESSION_FILE)) {
      prev = JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  const now = Date.now();
  // Reuse session if within TTL; cheaply update touched timestamp at most
  // once per minute to avoid hammering the file on rapid commands.
  if (prev && prev.id && now - (prev.touched || 0) < SESSION_TTL_MS) {
    if (now - (prev.touched || 0) > 60_000) {
      try { writeFileSync(SESSION_FILE, JSON.stringify({ id: prev.id, touched: now })); }
      catch { /* ignore */ }
    }
    return prev.id;
  }
  const id = randomUUID();
  try {
    ensureDir();
    writeFileSync(SESSION_FILE, JSON.stringify({ id, touched: now }));
  } catch { /* ignore */ }
  return id;
}

function _send(event, payload) {
  if (disabled() || !ENDPOINT) return;
  // Fire-and-forget. No await; can't keep the process alive.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  if (typeof timer.unref === 'function') timer.unref();
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      device_id: getDeviceId(),
      session_id: getSessionId(),
      ts: Date.now(),
      ...payload,
    }),
    signal: ctrl.signal,
  })
    .catch(() => { /* fire-and-forget */ })
    .finally(() => clearTimeout(timer));
}

function flagNames(opts) {
  // Extract flag names from a commander options object. Values stripped.
  if (!opts || typeof opts !== 'object') return [];
  return Object.keys(opts).filter((k) => !k.startsWith('_') && k !== 'parent');
}

export function trackCommandSucceeded(command, opts, { durationMs } = {}) {
  _send('command_succeeded', {
    command,
    flags: flagNames(opts),
    duration_ms: typeof durationMs === 'number' ? Math.round(durationMs) : null,
  });
}

export function trackCommandFailed(command, opts, { errorCode, durationMs } = {}) {
  _send('command_failed', {
    command,
    flags: flagNames(opts),
    error_code: errorCode || 'unknown',
    duration_ms: typeof durationMs === 'number' ? Math.round(durationMs) : null,
  });
}
