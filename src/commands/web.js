import { callTool } from '../mcp-client.js';
import { emit, emitError } from '../format.js';
import { parseInt10 } from '../util.js';

export function registerWeb(program) {
  const cmd = program
    .command('web')
    .description('Web search + fetch (Tavily / Serper / Cerebras)');

  cmd
    .command('search <query...>')
    .description('Web search (Tavily primary, Serper Google fallback)')
    .option('--max <n>', 'Max results (default 5, max 10)', '5')
    .option('--depth <d>', 'Tavily depth: basic | advanced', 'basic')
    .option('--json', 'Emit JSON')
    .action(async (queryParts, opts) => {
      try {
        const r = await callTool('web_search', {
          query: queryParts.join(' '),
          max_results: parseInt10(opts.max, 5),
          search_depth: opts.depth,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });

  cmd
    .command('fetch <url>')
    .description('Fetch URL and optionally answer a question about it')
    .option('--ask <question>', 'Question to answer from the content (uses Cerebras)')
    .option('--json', 'Emit JSON')
    .action(async (url, opts) => {
      try {
        const r = await callTool('web_fetch', {
          url,
          question: opts.ask,
        });
        emit(r, opts);
      } catch (err) { emitError(err, opts); }
    });
}
