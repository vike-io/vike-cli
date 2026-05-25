import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerPolymarket(program) {
  const cmd = program
    .command('polymarket')
    .alias('pm')
    .description('Polymarket prediction-market analytics (markets, traders, smart money)');

  cmd
    .command('markets')
    .description('Trending Polymarket markets ranked by 24h volume')
    .option('--category <c>', 'Crypto | Sports | Politics | Pop-Culture | Tech | all', 'all')
    .option('--limit <n>', 'Max markets (max 30)', '10')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('polymarket_markets', {
          category: opts.category,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('market <condition_id>')
    .description('Deep-dive on one Polymarket market by condition_id')
    .option('--json', 'Emit JSON')
    .action(async (conditionId, opts) => {
      try {
        const r = await callTool('polymarket_market_detail', {
          condition_id: conditionId,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('wallet <address>')
    .description('Profile a Polymarket trader (PnL / hit-rate / categories)')
    .option('--window <w>', '24h | 7d | 30d | all', 'all')
    .option('--json', 'Emit JSON')
    .action(async (address, opts) => {
      try {
        const r = await callTool('polymarket_wallet', {
          address,
          window: opts.window,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('smart-money')
    .description('Smart-money flows or mispricings on Polymarket')
    .option('--mode <m>', 'flows | mispricings', 'flows')
    .option('--hours <n>', 'Lookback hours', '24')
    .option('--category <c>', 'Crypto | Sports | Politics | Pop-Culture | Tech | all', 'all')
    .option('--limit <n>', 'Max rows (max 20)', '10')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('polymarket_smart_money', {
          mode: opts.mode,
          hours: parseInt10(opts.hours, 24),
          category: opts.category,
          limit: parseInt10(opts.limit, 10),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
