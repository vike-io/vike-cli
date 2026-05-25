// Pretest changeset validator.
//
// Asymmetric design:
// - Missing changesets → soft warning, exit 0  (running tests w/o
//   changeset is normal; people add the changeset later)
// - Wrong package name in a changeset's frontmatter → hard fail, exit 1
//   (silent typos let `changeset version` no-op and break releases
//   weeks later — the bug that motivated this file)

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHANGESET_DIR = join(ROOT, '.changeset');
const PACKAGE_NAME = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).name;

if (!existsSync(CHANGESET_DIR)) {
  process.exit(0);
}

const entries = readdirSync(CHANGESET_DIR)
  .filter((f) => f.endsWith('.md') && f !== 'README.md');

if (entries.length === 0) {
  process.stderr.write(
    'changeset check: no pending changesets (this is fine; add one with `npx changeset` before publishing)\n',
  );
  process.exit(0);
}

let errors = 0;
for (const f of entries) {
  const body = readFileSync(join(CHANGESET_DIR, f), 'utf8');
  const fm = body.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    process.stderr.write(`changeset check: ${f} has no frontmatter\n`);
    errors += 1;
    continue;
  }
  // Each line: "package-name": bump
  const lines = fm[1].split('\n').filter(Boolean);
  for (const line of lines) {
    const m = line.match(/^['"]?([^'":]+)['"]?\s*:\s*(patch|minor|major)\s*$/);
    if (!m) {
      process.stderr.write(`changeset check: ${f} has malformed line: ${line}\n`);
      errors += 1;
      continue;
    }
    const name = m[1].trim();
    if (name !== PACKAGE_NAME) {
      process.stderr.write(
        `changeset check: ${f} references "${name}" but this package is "${PACKAGE_NAME}". ` +
        'A changeset with the wrong name will silently no-op `changeset version`.\n',
      );
      errors += 1;
    }
  }
}

if (errors > 0) {
  process.stderr.write(`\nchangeset check: ${errors} error(s); fix before publishing.\n`);
  process.exit(1);
}
process.exit(0);
