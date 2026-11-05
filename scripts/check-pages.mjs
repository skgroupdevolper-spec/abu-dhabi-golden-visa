// CI helper: opens pages in Chrome, records console errors and basic layout facts.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'http://localhost:3000';
const pages = ['/', '/ar/', '/ur/golden-visa/', '/golden-visa-cost/'];
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
for (const path of pages) {
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport: vp });
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const facts = await page.evaluate(() => {
      const h = document.querySelector('header')?.getBoundingClientRect();
      const h1 = document.querySelector('h1')?.getBoundingClientRect();
      return {
        scrollX: window.scrollX, scrollY: window.scrollY,
        docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight,
        header: h && [Math.round(h.x), Math.round(h.y), Math.round(h.width)],
        h1: h1 && [Math.round(h1.x), Math.round(h1.y), Math.round(h1.width)],
        h1Opacity: document.querySelector('h1') && getComputedStyle(document.querySelector('h1')).opacity,
        mainOpacity: getComputedStyle(document.querySelector('main')).opacity,
        text: document.body.innerText.length,
      };
    });
    const name = (path.replace(/\//g, '_') || 'home') + '-' + vp.width;
    await page.screenshot({ path: `shots/check${name}.png` });
    report.push({ path, vp: vp.width, errors, facts });
    await page.close();
  }
}
await browser.close();
writeFileSync('shots/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
