import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerOhlcv(program) {
  program
    .command('ohlcv <symbol>')
    .description('Historical CEX candles for a ticker (BTC) or pair (BTCUSDT) across any timeframe')
    .option('--interval <i>', '1m | 3m | 5m | 15m | 30m | 1h | 2h | 4h | 6h | 8h | 12h | 1d | 1w', '1h')
    .option('--exchange <e>', 'Pin one venue: binance | bybit | okx | gate | kucoin | coinbase | mexc | pyth. Omit for merged best-source.')
    .option('--market <m>', 'spot | perp', 'spot')
    .option('--start <t>', 'ISO-8601 UTC or epoch ms (inclusive)')
    .option('--end <t>', 'ISO-8601 UTC or epoch ms (exclusive)')
    .option('--limit <n>', 'Max candles (default 500, max 5000)', '500')
    .option('--cursor <c>', 'Opaque paging cursor from a previous call')
    .option('--json', 'Emit JSON')
    .action(async (symbol, opts) => {
      try {
        const args = {
          symbol,
          interval: opts.interval,
          market: opts.market,
          limit: parseInt10(opts.limit, 500),
        };
        if (opts.exchange !== undefined) args.exchange = opts.exchange;
        if (opts.start !== undefined) args.start = opts.start;
        if (opts.end !== undefined) args.end = opts.end;
        if (opts.cursor !== undefined) args.cursor = opts.cursor;
        const r = await callTool('ohlcv', args);
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
