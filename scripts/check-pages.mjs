// CI helper: opens pages in Chrome, records console errors and basic layout facts.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'http://localhost:3000';
const pages = ['/', '/ar/', '/ur/golden-visa/', '/golden-visa-cost/', '/golden-visa/property-investment/', '/services/maid-visa/', '/family-golden-visa/newborn/', '/apply/', '/blog/', '/blog/category/property-investors/'];
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
  for (const p of ['settings', 'whatsapp', 'users', 'chatbot', 'languages', 'autopublisher', 'posts', 'pages', 'services', 'media', 'notifications', 'design', 'seo', 'categories', 'posts/new', 'header', 'profile', 'languages/edit']) {
    await page.goto(base + `/admin/${p}/`);
    await page.screenshot({ path: `shots/admin-${p.replace('/', '-')}-${vp.width}.png`, fullPage: true });
  }
  await page.goto(base + '/admin/pages/edit/?path=%2Fgolden-visa%2Fproperty-investment%2F');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/admin-builder-${vp.width}.png`, fullPage: true });
  if (vp.width > 1000) { await page.click('text=Add section at top'); await page.waitForTimeout(400); await page.screenshot({ path: 'shots/admin-builder-add.png' }); await page.keyboard.press('Escape'); }
  await page.goto(base + '/portal/login/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `shots/portal-login-${vp.width}.png`, fullPage: true });
  await page.goto(base + `/portal/t/${T}/`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/portal-${vp.width}.png`, fullPage: true });
  // customer sign-up, Arabic, dashboard
  const cust = await browser.newPage({ viewport: vp });
  await cust.goto(base + '/portal/register/');
  await cust.selectOption('select[name=lang]', 'ar');
  await cust.waitForLoadState('networkidle');
  await cust.fill('#name', 'Sample Customer');
  await cust.fill('#email', `c${vp.width}@example.com`);
  await cust.fill('#phone', '+971500000000');
  await cust.fill('#password', 'sample-pass-123');
  await Promise.all([cust.waitForURL('**/portal/'), cust.click('button[type=submit]')]);
  await cust.waitForTimeout(800);
  await cust.screenshot({ path: `shots/portal-home-ar-${vp.width}.png`, fullPage: true });
  await cust.close();
  report.push({ path: 'dashboards', vp: vp.width, errors, facts: await page.evaluate(() => ({ docW: document.documentElement.scrollWidth })) });
  await page.close();
}
// homepage calculator pop-up
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/services/maid-visa/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/service-page.png' });
  await page.screenshot({ path: 'shots/service-page-full.png', fullPage: true });
  // mega menus
  for (const label of ['Golden Visa', 'Our Services', 'Contact']) {
    await page.hover(`.nav button:has-text("${label}")`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `shots/mega-${label.replace(/ /g, '-').toLowerCase()}.png` });
    await page.mouse.move(5, 600);
    await page.waitForTimeout(300);
  }
  // online application, start to finish
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  writeFileSync('shots/passport-sample.pdf', '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
  await page.goto(base + '/apply/?service=gv-property');
  await page.waitForTimeout(900);
  await page.fill('#ap-name', 'Sample Applicant');
  await page.fill('#ap-phone', '+971500000001');
  await page.fill('#ap-email', 'apply@example.com');
  await page.fill('#ap-nat', 'British');
  await page.screenshot({ path: 'shots/apply-1.png', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.click('text=+ Add spouse');
  await page.fill('.fam-row input', 'Sample Spouse');
  await page.click('text=+ Add child');
  await page.locator('.fam-row input').nth(1).fill('Sample Child');
  await page.screenshot({ path: 'shots/apply-2.png', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.locator('.doc-up input').first().setInputFiles('shots/passport-sample.pdf');
  await page.screenshot({ path: 'shots/apply-3.png', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.check('.check input');
  await page.screenshot({ path: 'shots/apply-4.png', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.waitForSelector('.apply-done', { timeout: 15000 });
  await page.screenshot({ path: 'shots/apply-done.png', fullPage: true });
  const ref = await page.textContent('.apply-done h2');
  report.push({ path: 'apply-flow', vp: 1440, errors: errs, facts: { ref } });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/golden-visa/property-investment/');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/property-mobile.png', fullPage: true });
  await page.goto(base + '/');
  await page.click('.calc-launch button >> nth=0');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shots/calc-popup.png' });
  await page.close();
}
await browser.close();
writeFileSync('shots/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
