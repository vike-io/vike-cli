import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerWallet(program) {
  const cmd = program
    .command('wallet')
    .description('Wallet metrics, discovery, and ranking');

  cmd
    .command('summary <address>')
    .description('Aggregate metrics: volume / inflow / outflow / pnl across windows')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('wallet_summary', { address });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('discover')
    .description('Top wallets ranked by volume / inflow / outflow / pnl / net_flow / tx_count')
    .option('--window <w>', '24h | 7d | 30d | 90d | all', '30d')
    .option('--sort <s>', 'volume | inflow | outflow | net_flow | tx_count | pnl', 'volume')
    .option('--order <o>', 'asc | desc', 'desc')
    .option('--chain <c>', 'ethereum | bsc', 'ethereum')
    .option('--size <n>', 'Page size (max 20)', '10')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('wallet_discover', {
          window: opts.window,
          sort: opts.sort,
          order: opts.order,
          chain: opts.chain,
          size: parseInt10(opts.size, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
