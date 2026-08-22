#!/usr/bin/env node
/* Privacy + integrity gate for a PUBLIC repo. Run before every commit;
   the pre-commit hook and CI both call it. Hard gates exit 1.
   Escape hatch: a line containing "privacy-ok" is skipped by the text
   scan (for legit 10-digit numeric constants) — use sparingly.
   Usage: node scripts/check.mjs [--quiet] */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const quiet = process.argv.includes('--quiet');
const root = execSync('git rev-parse --show-toplevel').toString().trim();
process.chdir(root);

const files = execSync('git ls-files --cached --others --exclude-standard')
  .toString()
  .split('\n')
  .filter(Boolean)
  .filter((f) => existsSync(f))
  .filter((f) => !f.startsWith('.githooks/'));

const BIN = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'zip',
  'gz',
  'exr',
  'mp4',
  'webm',
]);
const ext = (f) => f.split('.').pop().toLowerCase();
const textFiles = files.filter((f) => !BIN.has(ext(f)) && ext(f) !== 'pdf');
const pdfFiles = files.filter((f) => ext(f) === 'pdf');

const PHONE = /(?<!\d)(?:\+?1[ .\-]?)?\(?\d{3}\)?[ .\-]?\d{3}[ .\-]?\d{4}(?!\d)/;
/* single owner of the word list: .githooks/private-words.txt */
const PRIVATE_WORDS = existsSync('.githooks/private-words.txt')
  ? readFileSync('.githooks/private-words.txt', 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'))
  : [];
const localStrings = existsSync('.privacy.local')
  ? readFileSync('.privacy.local', 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'))
  : [];

const hard = [],
  advisory = [];

/* ── privacy: text files, line by line ── */
for (const f of textFiles) {
  let body;
  try {
    body = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  body.split('\n').forEach((line, i) => {
    /* privacy-ok and doi.org exempt a line from the PHONE scan ONLY
       (numeric constants / DOI suffixes are phone-shaped) — the word and
       .privacy.local scans always run on every line */
    if (!line.includes('privacy-ok') && !line.includes('doi.org') && PHONE.test(line))
      hard.push(`${f}:${i + 1}: phone-shaped string`);
    for (const w of PRIVATE_WORDS)
      if (line.toLowerCase().includes(w))
        hard.push(`${f}:${i + 1}: private-artifact reference "${w}"`);
    for (const s of localStrings)
      if (line.includes(s)) hard.push(`${f}:${i + 1}: string from .privacy.local`);
  });
}

/* ── privacy: PDFs (the hook can't grep binaries — this can) ── */
for (const f of pdfFiles) {
  let text;
  try {
    text = execSync(`pdftotext ${JSON.stringify(f)} -`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
  } catch {
    hard.push(
      `${f}: cannot extract PDF text — install poppler-utils (pdftotext); unscanned PDFs do not ship`,
    );
    continue;
  }
  if (PHONE.test(text)) hard.push(`${f}: phone-shaped string inside PDF`);
  for (const w of PRIVATE_WORDS)
    if (text.toLowerCase().includes(w))
      hard.push(`${f}: private-artifact reference "${w}" inside PDF`);
  for (const s of localStrings)
    if (text.includes(s)) hard.push(`${f}: .privacy.local string inside PDF`);
}

/* archives can smuggle anything past the text scans — none belongs here */
for (const f of files.filter((f) => ['zip', 'gz', 'tar', '7z', 'rar'].includes(ext(f))))
  hard.push(`${f}: archive in the public tree — unscannable; unpack or remove`);

/* ── integrity: relative links in HTML resolve ── */
for (const f of textFiles.filter((f) => ext(f) === 'html')) {
  const body = readFileSync(f, 'utf8');
  for (const m of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|#|data:|javascript:|\/\/)/.test(url)) continue;
    const target = url.split(/[?#]/)[0];
    if (!target) continue;
    if (!existsSync(path.join(path.dirname(f), decodeURIComponent(target))))
      hard.push(`${f}: broken relative link "${url}"`);
  }
}

/* ── integrity: theme token parity (every [data-theme] block defines the
      same variable set — the token contract) ── */
for (const f of textFiles.filter((f) => ext(f) === 'css')) {
  const body = readFileSync(f, 'utf8');
  const themes = [...body.matchAll(/\[data-theme="([^"]+)"\]\s*\{([^}]*)\}/g)].map((m) => [
    m[1],
    new Set([...m[2].matchAll(/--([\w-]+)\s*:/g)].map((v) => v[1])),
  ]);
  if (themes.length < 2) continue;
  const [refName, refSet] = themes[0];
  for (const [name, set] of themes.slice(1)) {
    const missing = [...refSet].filter((v) => !set.has(v));
    const extra = [...set].filter((v) => !refSet.has(v));
    if (missing.length)
      hard.push(`${f}: theme "${name}" missing tokens vs "${refName}": ${missing.join(', ')}`);
    if (extra.length)
      hard.push(`${f}: theme "${name}" has tokens "${refName}" lacks: ${extra.join(', ')}`);
  }
}

/* ── advisory: quantities on pages should trace to BRIEF's fact packs ── */
const norm = (s) => s.replace(/[\s,]/g, '').replace(/x/gi, '×').toLowerCase();
const brief = existsSync('design/BRIEF.md')
  ? norm(readFileSync('design/BRIEF.md', 'utf8'))
  : '';
for (const f of textFiles.filter((f) => ext(f) === 'html')) {
  const text = readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' ');
  for (const m of text.matchAll(
    /(~?\d[\d,]*(?:\.\d+)?)\s?(×|x\b|%|dB|MB|GB|TB|FPS|spp|ms)/gi,
  )) {
    const tok = norm(m[1] + m[2]);
    if (brief && !brief.includes(tok.replace(/^~/, '')))
      advisory.push(
        `${f}: quantity "${m[0].trim()}" not found in BRIEF.md — verify it traces to a fact pack`,
      );
  }
}

/* ── cache-busting (owner-caught failure 2026-08-22, twice): a changed
      js/css file must carry a NEW ?v= in index.html, or browsers serve
      the stale build ── */
try {
  const changed = execSync('git diff HEAD --name-only')
    .toString()
    .split('\n')
    .filter((f) => /^(js|css)\//.test(f));
  if (changed.length && existsSync('index.html')) {
    const cur = readFileSync('index.html', 'utf8');
    let prev = '';
    try {
      prev = execSync('git show HEAD:index.html', {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString();
    } catch {}
    const esc = (f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const ver = (txt, f) => {
      const m = txt.match(new RegExp(esc(f) + '\\?v=(\\d+)'));
      return m ? m[1] : null;
    };
    for (const f of changed) {
      const vc = ver(cur, f);
      if (vc === null) continue;
      const vp = ver(prev, f);
      if (vp !== null && vp === vc)
        hard.push(`${f}: content changed but index.html still loads ?v=${vc} — bump it`);
    }
  }
} catch {}

/* ── formatting (owner ruling 2026-08-21: readable source ships) ── */
if (existsSync('node_modules/.bin/prettier')) {
  const { spawnSync } = await import('child_process');
  const r = spawnSync('node_modules/.bin/prettier', ['--check', 'js/*.js', 'scripts/*.mjs'], {
    encoding: 'utf8',
  });
  if (r.status !== 0)
    hard.push(
      'unformatted source (run: npx prettier --write "js/*.js" "scripts/*.mjs"):\n  ' +
        (r.stdout + r.stderr).trim().split('\n').slice(0, 8).join('\n  '),
    );
} else {
  advisory.push('prettier not installed — format check skipped (npm i)');
}

/* ── report ── */
const uniq = (a) => [...new Set(a)];
if (!quiet && advisory.length) console.log('advisory:\n  ' + uniq(advisory).join('\n  '));
if (hard.length) {
  console.error('HARD GATE FAILED — do not commit:\n  ' + uniq(hard).join('\n  '));
  process.exit(1);
}
if (!quiet)
  console.log(`check: clean (${textFiles.length} text files, ${pdfFiles.length} PDFs scanned)`);
