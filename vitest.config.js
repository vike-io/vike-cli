import { defineConfig } from 'vitest/config';

// Unit / integration tests. Fast (target <30s for the suite).
// e2e tests live in a sibling config and are NOT run by `npm test`.
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs}', 'tests/**/*.{test,spec}.{js,mjs}'],
    exclude: ['**/node_modules/**', '**/*.e2e.test.{js,mjs}'],
    testTimeout: 30_000,
    env: {
      // Tests must never phone home, regardless of which test imports the
      // telemetry module. Belt-and-suspenders with the module's own
      // CI/DO_NOT_TRACK guards.
      VIKE_NO_TELEMETRY: '1',
      DO_NOT_TRACK: '1',
    },
  },
});
