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
// dashboards
const T = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
for (const vp of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: vp });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(base + '/admin/login/');
  await page.fill('#email', 'admin@ci.local');
  await page.fill('#password', 'ci-password-123');
  await Promise.all([page.waitForURL('**/admin/'), page.click('button[type=submit]')]);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/admin-overview-${vp.width}.png`, fullPage: true });
  await page.goto(base + '/admin/applications/sample1/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/admin-app-${vp.width}.png`, fullPage: true });
  await page.goto(base + '/admin/leads/');
  await page.screenshot({ path: `shots/admin-leads-${vp.width}.png`, fullPage: true });
  await page.goto(base + `/portal/t/${T}/`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/portal-${vp.width}.png`, fullPage: true });
  report.push({ path: 'dashboards', vp: vp.width, errors, facts: await page.evaluate(() => ({ docW: document.documentElement.scrollWidth })) });
  await page.close();
}
// homepage calculator pop-up
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/');
  await page.click('.calc-launch button >> nth=0');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shots/calc-popup.png' });
  await page.close();
}
await browser.close();
writeFileSync('shots/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
