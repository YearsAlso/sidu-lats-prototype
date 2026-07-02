// Stop hook: session-ended auto-commit safety net.
// For meaningful commit messages, the commit-writer agent should be used during the conversation.
// This hook catches remaining uncommitted work at session end and records the full change list.

const { execSync } = require('child_process');

try {
  const cwd = process.cwd();

  // Only run if we are in a git repo
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' });
  } catch {
    process.exit(0); // Not a git repo; nothing to do.
  }

  const status = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
  if (!status) {
    process.exit(0); // clean tree
  }

  const lines = status.split('\n').filter(Boolean);

  // Parse porcelain: "XY <path>" — XY is a 2-col status code, then a space, then the path.
  const entries = lines.map((l) => {
    const code = l.slice(0, 2).trim();
    let path = l.slice(2).replace(/^\s+/, '');
    // Renames look like "old -> new"; keep the new path
    if (path.includes(' -> ')) path = path.split(' -> ')[1];
    return { code, path };
  });

  // Map porcelain code to a readable verb
  const verbOf = (code) => {
    if (code === '??') return '新增';
    if (code.includes('D')) return '删除';
    if (code.includes('A')) return '新增';
    if (code.includes('R')) return '重命名';
    if (code.includes('M')) return '修改';
    return '变更';
  };

  // Determine scope from file paths
  const scopeHints = [
    ['prototype/', 'prototype'],
    ['.claude/', 'rules'],
    ['CLAUDE.md', 'config'],
    ['openspec/', 'spec'],
    ['src/viewer/', 'viewer'],
    ['src/components/', 'components'],
    ['src/', 'src'],
    ['package.json', 'config'],
    ['pnpm-lock.yaml', 'config'],
    ['vite.config', 'config'],
  ];
  const scopeOf = (p) => {
    for (const [prefix, s] of scopeHints) {
      if (p.startsWith(prefix) || p === prefix) return s;
    }
    return 'misc';
  };

  // Count files per scope to pick the dominant scope for the title
  const scopeCount = {};
  for (const e of entries) {
    const s = scopeOf(e.path);
    scopeCount[s] = (scopeCount[s] || 0) + 1;
  }
  const scope = Object.entries(scopeCount).sort((a, b) => b[1] - a[1])[0][0];

  // Title: dominant scope + file count
  const title = 'chore(' + scope + '): 会话结束自动提交 ' + entries.length + ' 个文件';

  // Body: full change list, one line per file with verb + path
  const bodyLines = entries.map((e) => '- ' + verbOf(e.code) + ' ' + e.path);
  const body = '本次自动提交包含以下变更：\n\n' + bodyLines.join('\n');

  // Write body to a temp file to avoid shell-escaping issues with -m
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const tmp = path.join(os.tmpdir(), 'claude-autocommit-msg.txt');
  fs.writeFileSync(tmp, title + '\n\n' + body, 'utf8');

  execSync('git add -A', { cwd });
  execSync('git commit -F "' + tmp + '"', { cwd });
  try { fs.unlinkSync(tmp); } catch {}

  console.error('[auto-commit] committed ' + entries.length + ' file(s) as: ' + title);
  console.log(JSON.stringify({
    systemMessage: '[auto-commit] 会话结束已提交 ' + entries.length + ' 个文件：\n' + bodyLines.join('\n')
  }));
} catch (e) {
  // Non-blocking: log but don't fail
  console.error('[auto-commit] error:', e.message);
}
