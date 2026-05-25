// Postinstall — print a friendly setup hint when the user installs vike-cli.
// Silent in CI environments to avoid log noise.

if (process.env.CI || process.env.npm_config_loglevel === 'silent') {
  process.exit(0);
}

const lines = [
  '',
  '  @vike-io/cli installed.',
  '',
  '  Next steps:',
  '    vike init                  — interactive setup',
  '    vike doctor                — verify your install',
  '    vike token search BTC      — your first query',
  '',
  '  Docs: https://vike.io/api',
  '',
];
process.stdout.write(lines.join('\n'));
