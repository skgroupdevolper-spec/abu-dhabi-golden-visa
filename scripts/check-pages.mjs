// CI helper: opens pages in Chrome, records console errors and basic layout facts.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'http://localhost:3000';
const pages = ['/', '/ar/', '/ur/golden-visa/', '/golden-visa-cost/', '/golden-visa/property-investment/', '/services/maid-visa/', '/family-golden-visa/newborn/', '/apply/', '/blog/', '/blog/category/property-investors/', '/blog/abu-dhabi-golden-visa-complete-guide/', '/contact/', '/how-to-apply/'];
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
    await page.screenshot({ path: `shots/check${name}.jpg` });
    report.push({ path, vp: vp.width, errors, facts });
    await page.close();
  }
}
// full pages after scrolling through (booking calendar, flight path, ticks)
for (const [path, w] of [['/contact/', 1440], ['/how-to-apply/', 1440], ['/about/', 1440], ['/', 1440], ['/contact/', 390], ['/ar/contact/', 390]]) {
  const pg = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await pg.goto(base + path, { waitUntil: 'networkidle' });
  for (let y = 0; y < 30; y++) { await pg.mouse.wheel(0, 700); await pg.waitForTimeout(120); }
  await pg.waitForTimeout(800);
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: `shots/full${(path.replace(/\//g, '_') || 'home')}${w === 390 ? '-m' : ''}.jpg`, fullPage: true, quality: 60 });
  report.push({ path: 'full ' + path, vp: w, errors: errs, facts: {} });
  await pg.close();
}
// automatic cover
{ const pg = await browser.newPage(); const r = await pg.goto(base + '/api/cover/?t=Abu%20Dhabi%20Golden%20Visa%20Through%20Property%20Investment&c=Property%20investors'); report.push({ path: 'cover', vp: 0, errors: r.status() === 200 ? [] : ['cover ' + r.status()], facts: { type: r.headers()['content-type'] } }); await pg.screenshot({ path: 'shots/cover.jpg' }); await pg.close(); }
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
  await page.screenshot({ path: `shots/admin-overview-${vp.width}.jpg`, fullPage: true });
  await page.goto(base + '/admin/applications/sample1/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/admin-app-${vp.width}.jpg`, fullPage: true });
  await page.goto(base + '/admin/leads/');
  await page.screenshot({ path: `shots/admin-leads-${vp.width}.jpg`, fullPage: true });
  for (const p of ['settings', 'whatsapp', 'users', 'chatbot', 'languages', 'autopublisher', 'posts', 'pages', 'services', 'media', 'notifications', 'design', 'seo', 'categories', 'posts/new', 'header', 'profile', 'languages/edit', 'fees', 'customers/?edit=new', 'bookings', 'bookings/?tab=settings', 'autopublisher/?tab=missions&edit=new', 'autopublisher/?tab=ai', 'autopublisher/?tab=quality', 'autopublisher/?tab=similarity', 'users/?edit=new', 'pages/edit/?path=%2F', 'payments']) {
    await page.goto(base + `/admin/${p.includes('?') ? p : p + '/'}`);
    const bad = await page.locator('text=Application error').count();
    if (bad) throw new Error(`Admin page failed: ${p}`);
    await page.screenshot({ path: `shots/admin-${p.replace(/[^a-z0-9]+/gi, '-')}-${vp.width}.png`, fullPage: true });
  }
  await page.goto(base + '/admin/pages/edit/?path=%2Fgolden-visa%2Fproperty-investment%2F');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/admin-builder-${vp.width}.jpg`, fullPage: true });
  if (vp.width > 1000) { await page.click('text=Add section at top'); await page.waitForTimeout(400); await page.screenshot({ path: 'shots/admin-builder-add.jpg' }); await page.keyboard.press('Escape'); }
  // payment pages: confirmation (paid), receipt PDF and an open request
  await page.goto(base + `/portal/t/${T}/pay/p1/return/`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/pay-return-${vp.width}.jpg`, fullPage: true });
  if (await page.locator('text=Application error').count()) throw new Error('Payment confirmation page failed');
  if (!(await page.locator('text=Payment received').count())) throw new Error('Payment confirmation page did not show the paid state');
  { const r = await page.request.get(base + `/portal/t/${T}/receipt/p1/pdf/`); if (r.status() !== 200 || !(r.headers()['content-type'] || '').includes('pdf')) throw new Error('Receipt PDF failed ' + r.status()); }
  { const r = await page.request.get(base + `/api/portal/pulse/?token=${T}`); if (r.status() !== 200) throw new Error('Pulse failed'); }
  { const r = await page.request.get(base + '/web/login/', { maxRedirects: 0 }); if (![307, 308].includes(r.status()) || !(r.headers()['location'] || '').includes('/portal/login')) throw new Error('/web/login redirect missing ' + r.status()); }
  await page.goto(base + '/portal/login/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `shots/portal-login-${vp.width}.jpg`, fullPage: true });
  await page.goto(base + `/portal/t/${T}/`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/portal-${vp.width}.jpg`, fullPage: true });
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
  await cust.screenshot({ path: `shots/portal-home-ar-${vp.width}.jpg`, fullPage: true });
  await cust.context().addCookies([{ name: 'adgv_lang', value: 'en', url: base }]);
  for (const sp of ['', 'files/', 'invoices/', 'calendar/', 'services/', 'statement/', `t/${T}/`]) {
    const r = await cust.goto(base + '/portal/' + sp);
    if (!r || r.status() !== 200) throw new Error('Client page failed: /portal/' + sp + ' ' + (r && r.status()));
    await cust.waitForTimeout(500);
    const w = await cust.evaluate(() => document.documentElement.scrollWidth);
    if (w > vp.width + 2) errors.push(`client /portal/${sp} wider than screen: ${w}`);
    await cust.screenshot({ path: `shots/client-${(sp || 'home').replace(/[\/]+/g, '-').replace(/-$/, '').slice(0, 20)}-${vp.width}.jpg`, fullPage: true });
  }
  await cust.close();
  report.push({ path: 'dashboards', vp: vp.width, errors, facts: await page.evaluate(() => ({ docW: document.documentElement.scrollWidth })) });
  await page.close();
}
// homepage calculator pop-up
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/services/maid-visa/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/service-page.jpg' });
  await page.screenshot({ path: 'shots/service-page-full.jpg', fullPage: true });
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
  await page.fill('#ap-pw', 'sample-pass-123');
  await page.screenshot({ path: 'shots/apply-1.jpg', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.click('text=+ Add spouse');
  await page.fill('.fam-row input', 'Sample Spouse');
  await page.click('text=+ Add child');
  await page.locator('.fam-row input').nth(1).fill('Sample Child');
  await page.screenshot({ path: 'shots/apply-2.jpg', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.locator('.doc-up input').first().setInputFiles('shots/passport-sample.pdf');
  await page.screenshot({ path: 'shots/apply-3.jpg', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.check('.check input');
  await page.screenshot({ path: 'shots/apply-4.jpg', fullPage: true });
  await page.click('.apply-nav .btn-red');
  await page.waitForSelector('.apply-done', { timeout: 15000 });
  await page.screenshot({ path: 'shots/apply-done.jpg', fullPage: true });
  const ref = await page.textContent('.apply-done h2');
  report.push({ path: 'apply-flow', vp: 1440, errors: errs, facts: { ref } });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/golden-visa/property-investment/');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/property-mobile.jpg', fullPage: true });
  await page.goto(base + '/');
  await page.click('.calc-launch button >> nth=0');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shots/calc-popup.jpg' });
  await page.close();
}
await browser.close();
writeFileSync('shots/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
