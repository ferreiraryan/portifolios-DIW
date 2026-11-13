import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const rootDir = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(rootDir, 'public', 'portfolios.json');
const outDir = path.join(rootDir, 'public', 'previews');

const portfolios = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
});

console.log(`Capturando previews de ${portfolios.length} portfólios...`);

let okCount = 0;
let failCount = 0;

for (const item of portfolios) {
  const outFile = path.join(outDir, `${item.id}.png`);
  const page = await context.newPage();
  try {
    await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: outFile, type: 'png' });
    okCount += 1;
    console.log(`[OK] ${item.link} -> public/previews/${item.id}.png`);
  } catch (err) {
    failCount += 1;
    console.warn(`[FAIL] ${item.link}: ${err.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\nConcluído: ${okCount} capturados, ${failCount} falharam.`);
