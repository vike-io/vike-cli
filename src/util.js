import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function readPackageVersion() {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

export function parseBool(v, fallback = false) {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
}

export function parseInt10(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}
