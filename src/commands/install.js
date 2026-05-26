// `vike install` — copy SKILL.md into the agent-discoverable locations for
// supported IDEs/agents so the skill loads without the user having to wire
// it up manually.
//
// Targets:
//   --claude    → ~/.claude/skills/vike/SKILL.md
//   --cursor    → ./.cursorrules           (project root, joined under "## vike skill" header)
//   --copilot   → ./.github/copilot-instructions.md  (same join pattern)
//   --agents    → ./AGENTS.md              (same join pattern, project-root convention)
//   --all       → all of the above
//
// Behaviour: idempotent. For files we don't own (project-root markdown), we
// detect a fenced "<!-- vike-skill:begin -->...<!-- vike-skill:end -->" block
// and replace just that block — never clobber the rest of the user's file.

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BEGIN = '<!-- vike-skill:begin -->';
const END = '<!-- vike-skill:end -->';

function readSkillSource() {
  // SKILL.md ships at the root of the npm package, two levels up from
  // src/commands/install.js.
  const here = fileURLToPath(import.meta.url);
  const candidate = resolve(dirname(here), '..', '..', 'SKILL.md');
  if (!existsSync(candidate)) {
    throw new Error(`SKILL.md not found at ${candidate}. Reinstall @vike-io/cli.`);
  }
  return readFileSync(candidate, 'utf8');
}

function writeStandalone(path, skill) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, skill, { mode: 0o644 });
  return { path, mode: 'replaced' };
}

function upsertBlock(path, skill, header) {
  const wrapped = `${BEGIN}\n${header ? header + '\n\n' : ''}${skill}\n${END}`;
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, wrapped + '\n', { mode: 0o644 });
    return { path, mode: 'created' };
  }
  const current = readFileSync(path, 'utf8');
  if (current.includes(BEGIN) && current.includes(END)) {
    const before = current.slice(0, current.indexOf(BEGIN));
    const after = current.slice(current.indexOf(END) + END.length);
    writeFileSync(path, before + wrapped + after, { mode: 0o644 });
    return { path, mode: 'updated' };
  }
  const sep = current.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(path, current + sep + wrapped + '\n', { mode: 0o644 });
  return { path, mode: 'appended' };
}

function installClaude(skill) {
  return writeStandalone(join(homedir(), '.claude', 'skills', 'vike', 'SKILL.md'), skill);
}
function installCursor(skill, cwd) {
  return upsertBlock(join(cwd, '.cursorrules'), skill, '# vike skill — on-chain analytics for AI agents');
}
function installCopilot(skill, cwd) {
  return upsertBlock(
    join(cwd, '.github', 'copilot-instructions.md'),
    skill,
    '# vike skill — on-chain analytics for AI agents'
  );
}
function installAgents(skill, cwd) {
  return upsertBlock(join(cwd, 'AGENTS.md'), skill, '# vike skill — on-chain analytics for AI agents');
}

export function registerInstall(program) {
  program
    .command('install')
    .description('Copy vike SKILL.md into agent-discoverable locations (Claude, Cursor, Copilot, AGENTS.md)')
    .option('--claude', 'Install to ~/.claude/skills/vike/SKILL.md')
    .option('--cursor', 'Append/update vike block in ./.cursorrules')
    .option('--copilot', 'Append/update vike block in ./.github/copilot-instructions.md')
    .option('--agents', 'Append/update vike block in ./AGENTS.md')
    .option('--all', 'Install to every supported target')
    .option('--cwd <dir>', 'Project root (defaults to current directory)')
    .action((opts) => {
      const cwd = opts.cwd ? resolve(opts.cwd) : process.cwd();
      const targets = opts.all
        ? { claude: true, cursor: true, copilot: true, agents: true }
        : opts;
      if (!targets.claude && !targets.cursor && !targets.copilot && !targets.agents) {
        console.error('No target selected. Use --claude / --cursor / --copilot / --agents / --all.');
        console.error('Examples:');
        console.error('  vike install --claude');
        console.error('  vike install --all');
        process.exitCode = 1;
        return;
      }
      let skill;
      try {
        skill = readSkillSource();
      } catch (e) {
        console.error(`vike install: ${e.message}`);
        process.exitCode = 1;
        return;
      }
      const results = [];
      try {
        if (targets.claude) results.push(installClaude(skill));
        if (targets.cursor) results.push(installCursor(skill, cwd));
        if (targets.copilot) results.push(installCopilot(skill, cwd));
        if (targets.agents) results.push(installAgents(skill, cwd));
      } catch (e) {
        console.error(`vike install: ${e.message}`);
        process.exitCode = 1;
        return;
      }
      for (const r of results) {
        const size = (() => { try { return statSync(r.path).size; } catch { return 0; } })();
        console.log(`${r.mode.padEnd(8)} ${r.path}  (${size} bytes)`);
      }
      console.log(`\nInstalled ${results.length} target(s). Restart your AI client to pick up the skill.`);
    });
}
