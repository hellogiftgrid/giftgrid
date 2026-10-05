const { ESLint } = require('eslint');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

async function main() {
  const eslint = new ESLint();
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const files = [...new Set((git('diff', '--name-only') + '\n' + git('ls-files', '--others', '--exclude-standard')).split(/\r?\n/))]
    .filter(file => /\.(tsx?|jsx?|[cm]js)$/.test(file) && fs.existsSync(file));
  const previousPaths = { 'app/(community)/community/page.tsx': 'app/(public)/community/page.tsx', 'app/(community)/giftgrid/page.tsx': 'app/giftgrid/page.tsx' };
  let newErrors = 0, existingErrors = 0;
  for (const file of files) {
    const [current] = await eslint.lintText(fs.readFileSync(file, 'utf8'), { filePath: file });
    let previous = '';
    try { previous = git('show', `HEAD:${previousPaths[file] || file}`); } catch { /* New file. */ }
    const [baseline] = previous ? await eslint.lintText(previous, { filePath: file }) : [{ messages: [] }];
    const counts = new Map();
    const key = message => `${message.ruleId}:${message.message.split('\n')[0]}`;
    for (const message of baseline.messages.filter(message => message.severity === 2)) counts.set(key(message), (counts.get(key(message)) || 0) + 1);
    for (const message of current.messages.filter(message => message.severity === 2)) {
      const count = counts.get(key(message)) || 0;
      if (count) { existingErrors++; counts.set(key(message), count - 1); }
      else { newErrors++; console.error(`${file}:${message.line} ${message.ruleId}: ${message.message.split('\n')[0]}`); }
    }
  }
  console.log(`Changed-file lint: ${files.length} files checked; ${newErrors} new errors; ${existingErrors} errors also present in HEAD.`);
  process.exitCode = newErrors ? 1 : 0;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
