import { listTools } from '../mcp-client.js';
import { emit, emitError } from '../format.js';

export function registerSchema(program) {
  program
    .command('schema')
    .description('Print the full MCP tool schema (names, descriptions, input schemas)')
    .option('--pretty', 'Human-friendly summary instead of raw JSON')
    .option('--json', 'Emit JSON (default)')
    .action(async (opts) => {
      try {
        const tools = await listTools();
        if (opts.pretty) {
          for (const t of tools) {
            console.log(`\n  ${t.name}`);
            console.log(`    ${(t.description || '').split('\n')[0]}`);
            const props = t.inputSchema?.properties ?? {};
            const required = new Set(t.inputSchema?.required ?? []);
            for (const [k, v] of Object.entries(props)) {
              const tag = required.has(k) ? '(required)' : '';
              const enumStr = Array.isArray(v.enum) ? ` [${v.enum.join('|')}]` : '';
              console.log(`      --${k}${enumStr} ${tag}`);
            }
          }
          console.log(`\n${tools.length} tools.`);
        } else {
          emit({ tools }, { json: true });
        }
      } catch (err) { emitError(err, opts); }
    });
}
