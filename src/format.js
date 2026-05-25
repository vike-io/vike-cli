// Output formatting — pretty-print for humans, JSON for pipes.

export function isJsonMode(opts) {
  return Boolean(opts?.json) || !process.stdout.isTTY;
}

export function emit(data, opts = {}) {
  if (isJsonMode(opts)) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    return;
  }
  // Human mode: light formatting for arrays of objects (most MCP responses).
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('(no results)');
      return;
    }
    printTable(data);
    return;
  }
  if (data && typeof data === 'object') {
    if (data.error) {
      console.error(`error: ${data.error}`);
      process.exitCode = 1;
      return;
    }
    // If it has a single array prop, print that as table.
    const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]));
    if (arrayKey && Object.keys(data).length <= 3) {
      printTable(data[arrayKey]);
      return;
    }
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  console.log(String(data));
}

function printTable(rows) {
  if (!rows.length) {
    console.log('(empty)');
    return;
  }
  // Collect a stable column order from the first row, then keep any
  // new keys at the end. Truncate values >80 chars.
  const cols = [];
  const seen = new Set();
  for (const row of rows) {
    for (const k of Object.keys(row || {})) {
      if (!seen.has(k)) { seen.add(k); cols.push(k); }
    }
  }
  const widths = cols.map((c) => Math.min(40, Math.max(c.length, ...rows.map((r) => fmt(r?.[c]).length))));
  const sep = '  ';
  console.log(cols.map((c, i) => c.padEnd(widths[i])).join(sep));
  console.log(widths.map((w) => '-'.repeat(w)).join(sep));
  for (const row of rows) {
    console.log(cols.map((c, i) => fmt(row?.[c]).padEnd(widths[i])).join(sep));
  }
}

function fmt(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(2) + 'K';
    return String(v);
  }
  if (typeof v === 'object') return JSON.stringify(v);
  const s = String(v);
  return s.length > 80 ? s.slice(0, 77) + '...' : s;
}

export function emitError(err, opts = {}) {
  const msg = err?.message ?? String(err);
  if (isJsonMode(opts)) {
    process.stdout.write(JSON.stringify({ error: msg }) + '\n');
  } else {
    console.error(`vike: ${msg}`);
  }
  process.exitCode = 1;
}
