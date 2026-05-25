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
    .command('counterparties <address>')
    .description('Top trading partners of a wallet by combined transfer volume')
    .option('--chain <c>', 'ethereum | bsc | base', 'ethereum')
    .option('--window <w>', '24h | 7d | 30d | 90d | 180d | all', '30d')
    .option('--limit <n>', 'Max counterparties (max 50)', '10')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('wallet_counterparties', {
          address,
          chain: opts.chain,
          window: opts.window,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('pnl-history <address>')
    .description('Daily net-flow series (proxy for daily PnL)')
    .option('--chain <c>', 'ethereum | bsc | base', 'ethereum')
    .option('--days <n>', 'Days back (max 365)', '30')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('wallet_pnl_history', {
          address,
          chain: opts.chain,
          days: parseInt10(opts.days, 30),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('balances <address>')
    .description('Current ERC-20 holdings across major EVM chains')
    .option('--chains <list>', 'Comma-separated chains (eth,bsc,base,arbitrum,polygon,optimism)')
    .option('--min-usd <n>', 'Filter dust below this USD value', '1')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const payload = { address, min_usd: opts.minUsd };
        if (opts.chains) {
          payload.chains = opts.chains.split(',').map((c) => c.trim()).filter(Boolean);
        }
        const r = await callTool('wallet_token_balances', payload);
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('ens <address>')
    .description('Reverse ENS lookup: address → vitalik.eth style name')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('wallet_ens', { address });
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
