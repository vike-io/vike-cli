import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerToken(program) {
  const cmd = program
    .command('token')
    .description('Token search, transfers, and price charts');

  cmd
    .command('search <query>')
    .description('Search tokens by symbol or name')
    .option('--chain <chain>', 'ethereum | bsc | base', 'ethereum')
    .option('--limit <n>', 'Max results', '10')
    .option('--json', 'Emit JSON')
    .action(async (query, opts) => {
      try {
        const r = await callTool('token_search', {
          query,
          chain: opts.chain,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('transfers <token_address>')
    .description('Top buyers/sellers for a token in a window')
    .option('--period <p>', '1h | 24h | 7d | 30d', '24h')
    .option('--tab <t>', 'bought | sold', 'sold')
    .option('--chain <chain>', 'ethereum | bsc | base | all', 'ethereum')
    .option('--json', 'Emit JSON')
    .action(async (tokenAddress, opts) => {
      try {
        const r = await callTool('token_transfers', {
          token_address: tokenAddress,
          period: opts.period,
          tab: opts.tab,
          chain: opts.chain,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('chart <token_address>')
    .description('OHLCV candle data for a token')
    .option('--interval <m>', '5 | 30 | 120 minutes', '30')
    .option('--json', 'Emit JSON')
    .action(async (tokenAddress, opts) => {
      try {
        const r = await callTool('token_chart', {
          token_address: tokenAddress,
          interval: opts.interval,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('holders <token_address>')
    .description('Top holders of a token by cumulative net inflow USD')
    .option('--chain <chain>', 'ethereum | bsc | base', 'ethereum')
    .option('--limit <n>', 'Max holders (max 50)', '10')
    .option('--json', 'Emit JSON')
    .action(async (tokenAddress, opts) => {
      try {
        const r = await callTool('token_holders', {
          token_address: tokenAddress,
          chain: opts.chain,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
