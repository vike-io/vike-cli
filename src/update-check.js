// Background update check — reads cached result synchronously on startup,
// kicks off the registry probe as a detached subprocess that survives
// process exit. Zero blocking I/O on the user's command.
//
// Pattern: print a one-liner the *next* time the user runs us, after the
// background check has cached the result. No "checking for updates..."
// spinner ever appears.
//
// Honors NO_UPDATE_NOTIFIER and CI (industry-standard opt-out).

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_DIR = join(homedir(), '.vike');
const CHECK_FILE = join(CONFIG_DIR, 'update-check.json');
const LAST_VERSION_FILE = join(CONFIG_DIR, 'last-version.json');
const PACKAGE_NAME = '@vike-io/cli';
const REGISTRY = 'https://registry.npmjs.org';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 day

function suppressed() {
  return process.env.NO_UPDATE_NOTIFIER === '1' ||
         process.env.CI ||
         process.env.NODE_ENV === 'test' ||
         process.env.VIKE_NO_UPDATE_CHECK === '1';
}

function readCache() {
  if (!existsSync(CHECK_FILE)) return null;
  try { return JSON.parse(readFileSync(CHECK_FILE, 'utf8')); } catch { return null; }
}

function writeCache(latest) {
  try {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(CHECK_FILE, JSON.stringify({ latest, checkedAt: Date.now() }, null, 2));
  } catch { /* ignore */ }
}

function cmpSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

// Synchronous: read whatever the background process last cached.
// Returns a notification string or null. Call at startup.
export function getUpdateNotification(currentVersion) {
  if (suppressed()) return null;
  const cache = readCache();
  if (!cache || !cache.latest) return null;
  if (cmpSemver(cache.latest, currentVersion) > 0) {
    return (
      `\n  Update available: ${currentVersion} → ${cache.latest}\n` +
      `  Run: npm install -g ${PACKAGE_NAME}\n`
    );
  }
  return null;
}

// Fire the check as a detached subprocess. Doesn't block process exit.
// Honors a 1-day cache window — re-checking on every command would
// hammer the npm registry.
export function scheduleUpdateCheck() {
  if (suppressed()) return;
  const cache = readCache();
  if (cache && Date.now() - (cache.checkedAt || 0) < CHECK_INTERVAL_MS) return;

  const __filename = fileURLToPath(import.meta.url);
  // Inline child script — no separate file needed, no dependency on
  // package layout, survives `npm install -g` symlinking.
  const code = `
    const https = require('https');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const file = path.join(os.homedir(), '.vike', 'update-check.json');
    https.get('${REGISTRY}/${PACKAGE_NAME}/latest', { timeout: 5000 }, (r) => {
      let buf = '';
      r.on('data', (c) => { buf += c; });
      r.on('end', () => {
        try {
          const v = JSON.parse(buf).version;
          if (!v) return;
          fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
          fs.writeFileSync(file, JSON.stringify({ latest: v, checkedAt: Date.now() }));
        } catch {}
      });
    }).on('error', () => {}).on('timeout', function () { this.destroy(); });
  `;

  try {
    const child = spawn(process.execPath, ['-e', code], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch { /* ignore */ }
}

// First-run-after-upgrade hook. Stores last-seen version; if it changes,
// prints a one-time "you upgraded" notice on the next command.
export function getUpgradeNotice(currentVersion) {
  if (suppressed()) return null;
  let last = null;
  try {
    if (existsSync(LAST_VERSION_FILE)) {
      last = JSON.parse(readFileSync(LAST_VERSION_FILE, 'utf8')).version;
    }
  } catch { /* ignore */ }
  try {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(LAST_VERSION_FILE, JSON.stringify({ version: currentVersion }));
  } catch { /* ignore */ }
  if (last && last !== currentVersion && cmpSemver(currentVersion, last) > 0) {
    return `\n  Updated to ${currentVersion} (was ${last}).\n`;
  }
  return null;
}
