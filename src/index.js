#!/usr/bin/env node
import { Command } from 'commander';
import { registerToken } from './commands/token.js';
import { registerWallet } from './commands/wallet.js';
import { registerPerp } from './commands/perp.js';
import { registerOptions } from './commands/options.js';
import { registerAlerts } from './commands/alerts.js';
import { registerPolymarket } from './commands/polymarket.js';
import { registerLabels } from './commands/labels.js';
import { registerWeb } from './commands/web.js';
// Note: registerLabels also registers `vike funds` and `vike defi` top-level
// commands. New wallet subcommands (counterparties, pnl-history, balances,
// ens) are added under registerWallet.
import { registerInit } from './commands/init.js';
import { registerDoctor } from './commands/doctor.js';
import { registerSchema } from './commands/schema.js';
import { registerLogin, registerLogout } from './commands/auth.js';
import { readPackageVersion } from './util.js';

const program = new Command();

program
  .name('vike')
  .description('AI-agent CLI for vike.io on-chain analytics')
  .version(readPackageVersion(), '-v, --version', 'Show CLI version');

registerLogin(program);
registerLogout(program);
registerInit(program);
registerDoctor(program);
registerSchema(program);
registerToken(program);
registerWallet(program);
registerPerp(program);
registerOptions(program);
registerAlerts(program);
registerPolymarket(program);
registerLabels(program);
registerWeb(program);

program.parseAsync(process.argv).catch((err) => {
  console.error(`vike: ${err.message ?? err}`);
  process.exitCode = 1;
});
