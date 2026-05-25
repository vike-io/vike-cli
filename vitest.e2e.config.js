import { defineConfig } from 'vitest/config';

// End-to-end tests — hit the live MCP at https://vike.io/mcp (or whatever
// VIKE_MCP_URL points at). Off by default — only runs via `npm run test:e2e`.
// Long timeout: some tools (token_holders, defi_positions) routinely take
// 10–20s.
export default defineConfig({
  test: {
    include: ['**/*.e2e.test.{js,mjs}', 'tests/e2e/**/*.{test,spec}.{js,mjs}'],
    exclude: ['**/node_modules/**'],
    testTimeout: 120_000,
    env: {
      VIKE_NO_TELEMETRY: '1',
      DO_NOT_TRACK: '1',
    },
  },
});
