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
  .toString().split('\n').filter(Boolean)
  .filter(f => existsSync(f))
  .filter(f => !f.startsWith('.githooks/'));

const BIN = new Set(['png','jpg','jpeg','gif','webp','ico','woff','woff2','ttf','otf','zip','gz','exr','mp4','webm']);
const ext = f => f.split('.').pop().toLowerCase();
const textFiles = files.filter(f => !BIN.has(ext(f)) && ext(f) !== 'pdf');
const pdfFiles = files.filter(f => ext(f) === 'pdf');

const PHONE = /(?<!\d)(?:\+?1[ .\-]?)?\(?\d{3}\)?[ .\-]?\d{3}[ .\-]?\d{4}(?!\d)/;
/* single owner of the word list: .githooks/private-words.txt */
const PRIVATE_WORDS = existsSync('.githooks/private-words.txt')
  ? readFileSync('.githooks/private-words.txt', 'utf8').split('\n')
      .map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];
const localStrings = existsSync('.privacy.local')
  ? readFileSync('.privacy.local', 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];

const hard = [], advisory = [];

/* ── privacy: text files, line by line ── */
for (const f of textFiles) {
  let body; try { body = readFileSync(f, 'utf8'); } catch { continue; }
  body.split('\n').forEach((line, i) => {
    if (line.includes('privacy-ok')) return;
    /* doi.org lines: DOI suffixes are phone-shaped; exempt from the
       phone scan only — word/local scans below still run on them */
    if (!line.includes('doi.org') && PHONE.test(line))
      hard.push(`${f}:${i + 1}: phone-shaped string`);
    for (const w of PRIVATE_WORDS) if (line.toLowerCase().includes(w)) hard.push(`${f}:${i + 1}: private-artifact reference "${w}"`);
    for (const s of localStrings) if (line.includes(s)) hard.push(`${f}:${i + 1}: string from .privacy.local`);
  });
}

/* ── privacy: PDFs (the hook can't grep binaries — this can) ── */
for (const f of pdfFiles) {
  let text;
  try { text = execSync(`pdftotext ${JSON.stringify(f)} -`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); }
  catch { hard.push(`${f}: cannot extract PDF text — install poppler-utils (pdftotext); unscanned PDFs do not ship`); continue; }
  if (PHONE.test(text)) hard.push(`${f}: phone-shaped string inside PDF`);
  for (const s of localStrings) if (text.includes(s)) hard.push(`${f}: .privacy.local string inside PDF`);
}

/* ── integrity: relative links in HTML resolve ── */
for (const f of textFiles.filter(f => ext(f) === 'html')) {
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
for (const f of textFiles.filter(f => ext(f) === 'css')) {
  const body = readFileSync(f, 'utf8');
  const themes = [...body.matchAll(/\[data-theme="([^"]+)"\]\s*\{([^}]*)\}/g)]
    .map(m => [m[1], new Set([...m[2].matchAll(/--([\w-]+)\s*:/g)].map(v => v[1]))]);
  if (themes.length < 2) continue;
  const [refName, refSet] = themes[0];
  for (const [name, set] of themes.slice(1)) {
    const missing = [...refSet].filter(v => !set.has(v));
    const extra = [...set].filter(v => !refSet.has(v));
    if (missing.length) hard.push(`${f}: theme "${name}" missing tokens vs "${refName}": ${missing.join(', ')}`);
    if (extra.length) hard.push(`${f}: theme "${name}" has tokens "${refName}" lacks: ${extra.join(', ')}`);
  }
}

/* ── advisory: quantities on pages should trace to BRIEF's fact packs ── */
const norm = s => s.replace(/[\s,]/g, '').replace(/x/gi, '×').toLowerCase();
const brief = existsSync('design/BRIEF.md') ? norm(readFileSync('design/BRIEF.md', 'utf8')) : '';
for (const f of textFiles.filter(f => ext(f) === 'html')) {
  const text = readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' ');
  for (const m of text.matchAll(/(~?\d[\d,]*(?:\.\d+)?)\s?(×|x\b|%|dB|MB|GB|TB|FPS|spp|ms)/gi)) {
    const tok = norm(m[1] + m[2]);
    if (brief && !brief.includes(tok.replace(/^~/, '')))
      advisory.push(`${f}: quantity "${m[0].trim()}" not found in BRIEF.md — verify it traces to a fact pack`);
  }
}

/* ── report ── */
const uniq = a => [...new Set(a)];
if (!quiet && advisory.length) console.log('advisory:\n  ' + uniq(advisory).join('\n  '));
if (hard.length) {
  console.error('HARD GATE FAILED — do not commit:\n  ' + uniq(hard).join('\n  '));
  process.exit(1);
}
if (!quiet) console.log(`check: clean (${textFiles.length} text files, ${pdfFiles.length} PDFs scanned)`);
