import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';

export function registerOptions(program) {
  const cmd = program
    .command('options')
    .description('Deribit options flow');

  cmd
    .command('flow')
    .description('Call/put flow, volume, and put-call ratios')
    .option('--symbol <s>', 'BTC | ETH | SOL', 'BTC')
    .option('--window <w>', '1d | 1w | 1m', '1d')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('options_flow', {
          symbol: opts.symbol,
          window: opts.window,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
