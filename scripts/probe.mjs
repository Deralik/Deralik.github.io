#!/usr/bin/env node
/* Drive the real site: screenshots, scripted interaction, console capture.
   The render loop for models — see a change before calling it done.

   Matrix sweep (REVIEW.md lens 6):
     node scripts/probe.mjs --matrix [--dir .] [--page index.html]
       [--themes h-transit,k-matrix] [--ls-key n-skeleton:theme] [--reduced]
   Scripted steps:
     node scripts/probe.mjs [--dir .] [--page index.html] [--w 1280 --h 800]
       [--theme NAME] steps...
   Steps: goto:#frag · press:ArrowDown · wheel:dx,dy · drag:x1,y1,x2,y2 ·
     click:x,y · click:css=SEL · hover:css=SEL · ls:key=val · reload ·
     wait:ms · shot:name · shotel:SEL,name · eval:EXPR
   Output: PNGs (paths printed) + console report. Exits 1 on uncaught
   page errors. */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : dflt;
};
const flag = name => argv.includes('--' + name);
const VALUE_OPTS = new Set(['--dir', '--page', '--ls-key', '--themes', '--out', '--w', '--h', '--theme']);
const steps = [];
for (let i = 0; i < argv.length; i++) {
  if (VALUE_OPTS.has(argv[i])) { i++; continue; }
  if (!argv[i].startsWith('--')) steps.push(argv[i]);
}

const dir = path.resolve(opt('dir', '.'));
const pageFile = opt('page', 'index.html');
const lsKey = opt('ls-key', 'n-skeleton:theme');
const themes = opt('themes', 'h-transit,k-matrix').split(',');
const out = opt('out', path.join(os.tmpdir(), 'portfolio-shots',
  new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)));
mkdirSync(out, { recursive: true });

/* static server: stdlib python, no dependency */
const port = 8123 + Math.floor(Math.random() * 800);
const server = spawn('python3', ['-m', 'http.server', String(port), '--directory', dir], { stdio: 'ignore' });
const base = `http://127.0.0.1:${port}/${pageFile}`;
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${port}/`); break; }
  catch { await new Promise(r => setTimeout(r, 100)); }
}

const browser = await chromium.launch();
const consoleLog = [], pageErrors = [];
const wire = page => {
  page.on('console', m => (m.type() === 'error' || m.type() === 'warning') &&
    consoleLog.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', e => pageErrors.push(String(e)));
};
const settle = page => page.waitForTimeout(1200); // canvas warm-starts

const shoot = async (page, name) => {
  const p = path.join(out, name.endsWith('.png') ? name : name + '.png');
  await page.screenshot({ path: p });
  console.log('shot: ' + p);
};

if (flag('matrix')) {
  const views = [[1280, 800], [1512, 950], [1920, 1080], [390, 844]];
  for (const theme of themes) {
    for (const [w, h] of views) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
      });
      const page = await ctx.newPage();
      wire(page);
      await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [lsKey, theme]);
      await page.goto(base, { waitUntil: 'load' });
      await settle(page);
      await shoot(page, `${theme}-${w}x${h}`);
      await ctx.close();
    }
  }
} else {
  const ctx = await browser.newContext({
    viewport: { width: +opt('w', 1280), height: +opt('h', 800) },
    reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  wire(page);
  const theme = opt('theme', null);
  if (theme) await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [lsKey, theme]);
  await page.goto(base, { waitUntil: 'load' });
  await settle(page);
  for (const s of steps) {
    const [cmd, ...restParts] = s.split(':');
    const rest = restParts.join(':');
    if (cmd === 'goto') await page.goto(base + rest, { waitUntil: 'load' });
    else if (cmd === 'press') await page.keyboard.press(rest);
    else if (cmd === 'wheel') { const [dx, dy] = rest.split(',').map(Number); await page.mouse.wheel(dx, dy); }
    else if (cmd === 'drag') {
      const [x1, y1, x2, y2] = rest.split(',').map(Number);
      await page.mouse.move(x1, y1); await page.mouse.down();
      for (let i = 1; i <= 8; i++) await page.mouse.move(x1 + (x2 - x1) * i / 8, y1 + (y2 - y1) * i / 8);
      await page.mouse.up();
    }
    else if (cmd === 'click' && rest.startsWith('css=')) await page.click(rest.slice(4));
    else if (cmd === 'click') { const [x, y] = rest.split(',').map(Number); await page.mouse.click(x, y); }
    else if (cmd === 'hover') await page.hover(rest.replace(/^css=/, ''));
    else if (cmd === 'ls') { const [k, v] = rest.split('='); await page.evaluate(([k2, v2]) => localStorage.setItem(k2, v2), [k, v]); }
    else if (cmd === 'reload') { await page.reload({ waitUntil: 'load' }); await settle(page); }
    else if (cmd === 'wait') await page.waitForTimeout(+rest);
    else if (cmd === 'shot') await shoot(page, rest);
    else if (cmd === 'shotel') { const [sel, name] = rest.split(','); await page.locator(sel).screenshot({ path: path.join(out, name + '.png') }); console.log('shot: ' + path.join(out, name + '.png')); }
    else if (cmd === 'eval') console.log('eval → ' + JSON.stringify(await page.evaluate(rest)));
    else console.warn('unknown step: ' + s);
  }
  await ctx.close();
}

await browser.close();
server.kill();
if (consoleLog.length) console.log('console:\n  ' + [...new Set(consoleLog)].join('\n  '));
if (pageErrors.length) {
  console.error('PAGE ERRORS (uncaught):\n  ' + [...new Set(pageErrors)].join('\n  '));
  process.exit(1);
}
console.log('probe: no uncaught page errors');
