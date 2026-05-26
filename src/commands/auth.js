import { saveApiKey, clearApiKey, getApiKey } from '../auth.js';
import { emit } from '../format.js';

export function registerLogin(program) {
  program
    .command('login')
    .description('Save an API key to ~/.vike/config.json')
    .option('--api-key <key>', 'API key (vk_...)')
    .action(async (opts) => {
      if (!opts.apiKey) {
        console.error('Pass --api-key <vk_...>. Get a key at https://vike.io/account?tab=api-keys');
        process.exitCode = 1;
        return;
      }
      const path = saveApiKey(opts.apiKey);
      emit({ ok: true, saved_to: path });
    });
}

export function registerLogout(program) {
  program
    .command('logout')
    .description('Remove the saved API key')
    .action(() => {
      const cleared = clearApiKey();
      emit({ ok: true, cleared });
    });
}

export function registerWhoami(program) {
  program
    .command('whoami')
    .description('Show which API key is in use (truncated)')
    .action(() => {
      const k = getApiKey();
      if (!k) {
        emit({ authenticated: false });
        return;
      }
      const masked = k.length > 12 ? `${k.slice(0, 8)}...${k.slice(-4)}` : '***';
      emit({ authenticated: true, api_key: masked, source: process.env.VIKE_API_KEY ? 'env' : 'config' });
    });
}
