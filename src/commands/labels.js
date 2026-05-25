import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerLabels(program) {
  // `vike labels <address>` — multi-source label provenance for one wallet
  program
    .command('labels <address>')
    .description('Multi-source label cascade for a wallet (10+ providers + in-house heuristic + consensus view)')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('wallet_label_provenance', { address });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  // `vike funds` — top labeled funds / MM / treasury / CEX by recent net inflow
  program
    .command('funds')
    .description('Top labeled fund / market-maker / treasury / CEX wallets by net inflow')
    .option('--kind <k>', 'funds | cex | mm | treasury', 'funds')
    .option('--window <w>', '7d | 30d | 90d | 180d | all', '30d')
    .option('--limit <n>', 'Max wallets (max 25)', '10')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('fund_holdings', {
          kind: opts.kind,
          window: opts.window,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  // `vike defi <address>` — DeBank protocol positions for a wallet
  program
    .command('defi <address>')
    .description('DeFi protocol positions for a wallet across all DeBank-supported chains')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('defi_positions', { address });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
