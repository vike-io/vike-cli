import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerPerp(program) {
  const cmd = program
    .command('perp')
    .description('Perpetual-futures funding, spreads, and Hyperliquid trader leaderboard');

  cmd
    .command('funding')
    .description('Funding rates per venue, or cross-venue funding-arb opportunities')
    .option('--symbol <s>', 'Specific symbol (e.g. BTC). Omit for top arb opportunities.')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('perp_funding', { symbol: opts.symbol });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('spreads')
    .description('Cross-venue spot-perp spread arbitrage opportunities')
    .option('--symbol <s>', 'Specific symbol. Omit for full matrix.')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('perp_spreads', { symbol: opts.symbol });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('top-traders')
    .description('Top Hyperliquid perp wallets by PnL / ROI / win rate / volume')
    .option('--window <w>', '1d | 7d | 30d | all', '30d')
    .option('--sort <s>', 'pnl | roi | win_rate | volume | trade_count | drawdown', 'pnl')
    .option('--order <o>', 'asc | desc', 'desc')
    .option('--min-trades <n>', 'Minimum trade count', '3')
    .option('--min-win-rate <p>', 'Minimum win rate percent (0-100)', '0')
    .option('--min-volume <usd>', 'Minimum volume USD', '0')
    .option('--size <n>', 'Page size (max 20)', '10')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('hl_perp_top_traders', {
          window: opts.window,
          sort: opts.sort,
          order: opts.order,
          min_trades: parseInt10(opts.minTrades, 3),
          min_win_rate: opts.minWinRate,
          min_volume: opts.minVolume,
          size: parseInt10(opts.size, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
