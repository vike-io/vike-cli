import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseBool, parseInt10 } from '../util.js';

export function registerAlerts(program) {
  const cmd = program
    .command('alerts')
    .description('Manage on-chain transfer alerts');

  cmd
    .command('list')
    .description('List your alerts')
    .option('--include-inactive', 'Include paused/deleted alerts')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('alerts_list', {
          include_inactive: parseBool(opts.includeInactive, false),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('channels')
    .description('List your enabled notification channels (email/discord)')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('alerts_list_channels', {});
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('create')
    .description('Create a new on-chain transfer alert')
    .requiredOption('--label <l>', 'Alert label (user-visible name)')
    .option('--token <sym>', 'Token ticker, UPPERCASE (e.g. USDC, ETH)')
    .option('--chain <c>', 'eth | bsc', 'eth')
    .option('--min-usd <n>', 'Minimum transfer USD value')
    .option('--max-usd <n>', 'Maximum transfer USD value')
    .option('--channel <c...>', 'Notification channel(s): email, discord')
    .option('--cooldown <min>', 'Minimum gap between triggers (minutes)', '60')
    .option('--json', 'Emit JSON')
    .action(async (opts) => {
      try {
        const r = await callTool('alerts_create', {
          label: opts.label,
          token_symbol: opts.token,
          chain: opts.chain,
          min_value_usd: opts.minUsd,
          max_value_usd: opts.maxUsd,
          channels: opts.channel,
          cooldown_minutes: parseInt10(opts.cooldown, 60),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('edit <alert_id>')
    .description('Update an alert (only fields you pass are modified)')
    .option('--label <l>')
    .option('--token <sym>')
    .option('--chain <c>')
    .option('--min-usd <n>')
    .option('--max-usd <n>')
    .option('--channel <c...>')
    .option('--cooldown <min>')
    .option('--active <bool>', 'Pause/resume (true|false)')
    .option('--json', 'Emit JSON')
    .action(async (alertId, opts) => {
      try {
        const payload = { alert_id: alertId };
        if (opts.label !== undefined) payload.label = opts.label;
        if (opts.token !== undefined) payload.token_symbol = opts.token;
        if (opts.chain !== undefined) payload.chain = opts.chain;
        if (opts.minUsd !== undefined) payload.min_value_usd = opts.minUsd;
        if (opts.maxUsd !== undefined) payload.max_value_usd = opts.maxUsd;
        if (opts.channel !== undefined) payload.channels = opts.channel;
        if (opts.cooldown !== undefined) payload.cooldown_minutes = opts.cooldown;
        if (opts.active !== undefined) payload.is_active = parseBool(opts.active, true);
        const r = await callTool('alerts_edit', payload);
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('delete <alert_id>')
    .description('Delete (or pause) an alert')
    .option('--hard', 'Hard-delete instead of pausing')
    .option('--json', 'Emit JSON')
    .action(async (alertId, opts) => {
      try {
        const r = await callTool('alerts_delete', {
          alert_id: alertId,
          hard: parseBool(opts.hard, false),
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
