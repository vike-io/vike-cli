import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(__dirname, '..', 'src', 'index.js');

describe('shebang', () => {
  it('src/index.js starts with #!/usr/bin/env node', () => {
    const first = readFileSync(ENTRY, 'utf8').split('\n', 1)[0];
    expect(first).toBe('#!/usr/bin/env node');
  });
});
