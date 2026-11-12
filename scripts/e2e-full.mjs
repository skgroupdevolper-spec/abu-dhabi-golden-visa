// CI: full website test for every kind of user, on computer and phone, plus security probes.
// Fails the build on real problems; layout notes are reported as warnings.
import { chromium, request } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'http://localhost:3000';
const T = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const fails = [], warns = [], stats = {};
const fail = (area, msg) => { fails.push(`[${area}] ${msg}`); console.log('FAIL', area, msg); };
const warn = (area, msg) => warns.push(`[${area}] ${msg}`);
const VP = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const IGNORE = /googleapis|google\.com|gstatic|CORS policy|favicon|ERR_ABORTED|net::ERR_|Failed to load resource|Download the React DevTools|ResizeObserver/i;

const api = await request.newContext({ baseURL: base });
const browser = await chromium.launch({ channel: 'chrome' });

/** Opens a page, records crashes, console errors, broken images and sideways scrolling. */
async function visit(page, url, area, { strictWidth = true } = {}) {
  const errs = [];
  const onErr = (e) => errs.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).join(' | ').replace(/\s+/g, ' ').slice(0, 300));
  const onCon = (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); };
  page.on('pageerror', onErr); page.on('console', onCon);
  let r;
  try { r = await page.goto(base + url, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { fail(area, `${url} did not load: ${e.message.slice(0, 120)}`); }
  await page.waitForTimeout(700);
  if (r && r.status() >= 400) fail(area, `${url} → HTTP ${r.status()}`);
  if (await page.locator('text=Application error').count()) fail(area, `${url} shows "Application error"`);
  const f = await page.evaluate(() => ({
    w: document.documentElement.scrollWidth,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy' && i.getBoundingClientRect().width > 0).map((i) => i.currentSrc || i.src).slice(0, 5),
  })).catch(() => ({ w: 0, broken: [] }));
  const vw = page.viewportSize().width;
  if (f.w > vw + 2) (strictWidth ? fail : warn)(area, `${url} is wider than the ${vw}px screen (${f.w}px)`);
  for (const b of f.broken) fail(area, `${url} broken image ${b}`);
  for (const e of errs) fail(area, `${url} ${e}`);
  page.off('pageerror', onErr); page.off('console', onCon);
  return r;
}

/* ---------- 1. Every URL in the sitemap answers 200 with title, canonical and hreflang ---------- */
{
  const xml = await (await api.get('/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  stats.sitemapUrls = urls.length;
  const langs = new Set(urls.map((u) => (u.match(/^\/([a-z]{2})\//) || [, 'en'])[1]));
  stats.sitemapLanguages = [...langs].sort().join(' ');
  let i = 0, ok = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      const r = await api.get(u).catch(() => null);
      if (!r || r.status() !== 200) { fail('sitemap', `${u} → ${r ? r.status() : 'no answer'}`); continue; }
      const h = await r.text();
      if (!/<title>[^<]{5,}<\/title>/.test(h)) fail('seo', `${u} has no title`);
      if (!/rel="canonical"/.test(h)) fail('seo', `${u} has no canonical`);
      if (!/hrefLang="ar"|hreflang="ar"/i.test(h)) warn('seo', `${u} has no Arabic hreflang`);
      if (/name="robots" content="noindex/.test(h)) warn('seo', `${u} is noindex but listed in the sitemap`);
      ok++;
    }
  };
  await Promise.all(Array.from({ length: 12 }, worker));
  stats.sitemapOk = ok;
}

/* ---------- 2. Visitors: key pages and a sample of every language, on computer and phone ---------- */
{
  const xml = await (await api.get('/sitemap.xml')).text();
  const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const pick = (re, n) => all.filter((u) => re.test(u)).sort(() => Math.random() - 0.5).slice(0, n);
  const sample = [...new Set(['/', '/ar/', '/ur/', '/ru/', '/zh/', '/golden-visa-cost/', '/apply/', '/contact/', '/about/', '/blog/', '/faqs/', '/how-to-apply/', '/visa-check/',
    ...pick(/^\/(?![a-z]{2}\/)/, 14), ...pick(/^\/(ar|ur|ru|tr|hi|zh|fr|de)\//, 14)])];
  for (const [name, vp] of Object.entries(VP)) {
    const page = await browser.newPage({ viewport: vp });
    for (const u of sample) {
      await visit(page, u, `visitor-${name}`);
      if (name !== 'desktop') continue;
      // scroll through the page like a visitor, then no heading or list may still be hidden
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 1500)); });
      const hidden = await page.evaluate(() => [...document.querySelectorAll('main h2, main .tx-i, main .card, main .step, main li.sk')].filter((e) => { const r = e.getBoundingClientRect(); if (!r.width) return false; const cs = getComputedStyle(e); return Number(cs.opacity) < 0.35 && e.getBoundingClientRect().top < window.innerHeight; }).map((e) => (e.textContent || '').trim().slice(0, 40)).slice(0, 5));
      if (hidden.length) fail('visitor-desktop', `${u} has text still hidden after scrolling: ${hidden.join(' | ')}`);
    }
    // phone menu opens
    if (name === 'mobile') {
      await page.goto(base + '/');
      const burger = page.locator('header button[aria-label*="enu" i], header .burger, header .menu-btn').first();
      if (await burger.count()) { await burger.click().catch(() => {}); await page.waitForTimeout(500); await page.screenshot({ path: 'shots/e2e-mobile-menu.jpg' }); }
      // phone footer and header, as a visitor sees them (screen-sized, not full-page)
      await page.goto(base + '/about/'); await page.waitForTimeout(800);
      await page.screenshot({ path: 'shots/e2e-mobile-header.jpg' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(1500);
      await page.screenshot({ path: 'shots/e2e-mobile-footer.jpg' });
      const hdr = await page.evaluate(() => { const h = document.querySelector('header.top .bar'); return h ? { w: h.scrollWidth, cw: h.clientWidth } : null; });
      if (hdr && hdr.w > hdr.cw + 1) fail('visitor-mobile', `header is wider than the phone screen (${hdr.w} > ${hdr.cw})`);
      // the Apply page on a phone: one column, nothing wider than the screen
      await page.goto(base + '/apply/'); await page.waitForTimeout(1200);
      await page.screenshot({ path: 'shots/e2e-mobile-apply.jpg' });
      const wide = await page.evaluate(() => [...document.querySelectorAll('.apply-body > *, .aw-card')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length);
      if (wide) fail('visitor-mobile', `apply page: ${wide} boxes wider than the phone screen`);
      if (await page.locator('header .tools .btn-gold').isVisible().catch(() => false)) fail('visitor-mobile', 'Apply button still shown in the phone header');
      // language menu must stay inside the screen
      const lb = page.locator('header .chip > button').first();
      if (await lb.count()) {
        await lb.click().catch(() => {}); await page.waitForTimeout(500);
        await page.screenshot({ path: 'shots/e2e-mobile-langs.jpg' });
        const box = await page.evaluate(() => { const d = document.querySelector('.drop.langs, .drop.curs'); if (!d) return null; const r = d.getBoundingClientRect(); return { l: r.left, r: r.right, w: window.innerWidth }; });
        if (box && (box.l < 0 || box.r > box.w + 1)) fail('visitor-mobile', `language menu leaves the screen (${Math.round(box.l)}..${Math.round(box.r)} of ${box.w})`);
      }
    }
    if (name === 'desktop') {
      await page.goto(base + '/about/'); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(6000);
      await page.locator('footer .fscene').screenshot({ path: 'shots/e2e-footer-scene.jpg' }).catch(() => {});
    }
    await page.close();
  }
  stats.visitorPages = sample.length * 2;
}

/* ---------- 3. Security probes (no sign-in) ---------- */
{
  const expect = async (area, method, url, ok, opts = {}) => {
    const r = await api.fetch(url, { method, maxRedirects: 0, ...opts }).catch(() => null);
    const s = r ? r.status() : 0;
    if (!ok.includes(s)) fail('security', `${area}: ${method} ${url} → ${s} (expected ${ok.join('/')})`);
    return r;
  };
  for (const p of ['/admin/', '/admin/users/', '/admin/settings/', '/admin/payments/', '/admin/customers/', '/admin/backup/', '/admin/export/'])
    await expect('admin page needs sign-in', 'GET', p, [302, 303, 307, 308, 401, 403, 404]);
  await expect('admin API', 'GET', '/api/admin/pulse/', [401]);
  await expect('admin API', 'GET', '/api/admin/media/', [401]);
  await expect('admin API', 'POST', '/api/admin/page/', [401], { data: {} });
  await expect('admin API', 'POST', '/api/admin/menu/', [401], { data: {} });
  await expect('client dashboard needs sign-in', 'GET', '/portal/', [302, 303, 307, 308]);
  await expect('client page needs sign-in', 'GET', '/portal/invoices/', [302, 303, 307, 308]);
  await expect('wrong file link', 'GET', '/portal/t/0000000000000000/', [404]);
  await expect('wrong file link download', 'GET', `/portal/t/0000000000000000/file/x/`, [404]);
  await expect('someone else’s receipt', 'GET', `/portal/t/0000000000000000/receipt/p1/pdf/`, [404]);
  await expect('path traversal', 'GET', '/media/..%2F..%2Fteam.json', [400, 404]);
  await expect('path traversal', 'GET', '/media/%2e%2e%2fteam.json', [400, 404]);
  await expect('data folder', 'GET', '/data/team.json', [404]);
  await expect('env file', 'GET', '/.env', [404]);
  await expect('cron without key', 'GET', '/api/cron/daily/', [403]);
  await expect('Stripe webhook without signature', 'POST', '/api/pay/webhook/stripe/', [400], { data: '{}' });
  await expect('TotalPay webhook with bad hash', 'POST', '/api/pay/webhook/totalpay/', [400], { form: { order_number: 'x', status: 'success', hash: 'bad' } });
  await expect('pulse without token', 'GET', '/api/portal/pulse/?token=nope', [401, 403, 404]);
  const h = (await api.get('/')).headers();
  for (const k of ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'strict-transport-security', 'permissions-policy'])
    if (!h[k]) fail('security', `header ${k} missing`);
  if (h['x-powered-by']) warn('security', 'x-powered-by header is shown');
  // spam limits on public forms
  let limited = false;
  for (let i = 0; i < 12; i++) { const r = await api.post('/api/subscribe/', { data: { email: `ci${i}@example.com` } }); if (r.status() === 429) { limited = true; break; } }
  if (!limited) fail('security', 'newsletter sign-up has no spam limit');
  // admin login brute force
  const lp = await browser.newPage();
  let locked = false;
  for (let i = 0; i < 10 && !locked; i++) {
    await lp.goto(base + '/admin/login/');
    await lp.fill('#email', 'nobody@ci.local'); await lp.fill('#password', 'wrong-' + i);
    await lp.click('button[type=submit]'); await lp.waitForTimeout(500);
    locked = (await lp.locator('text=Too many attempts').count()) > 0;
  }
  if (!locked) fail('security', 'admin login is not locked after many wrong passwords');
  await lp.close();
  // stored XSS: a lead with HTML in the name must not run in the admin
  await api.post('/api/leads/', { data: { name: '<img src=x onerror="window.__xss=1;alert(1)">', phone: '+971500000099', source: 'ci-xss' }, headers: { 'x-forwarded-for': '10.9.9.9' } });
}

/* ---------- 4. Team: owner (env admin) opens every admin section on computer and phone ---------- */
async function adminLogin(page, email, pass) {
  await page.goto(base + '/admin/login/');
  await page.fill('#email', email); await page.fill('#password', pass);
  await Promise.all([page.waitForURL('**/admin/**', { timeout: 15000 }).catch(() => {}), page.click('button[type=submit]')]);
  await page.waitForTimeout(600);
  return !page.url().includes('/login');
}
const SECTIONS = ['', 'notifications/', 'leads/', 'applications/', 'applications/sample1/', 'customers/', 'bookings/', 'payments/', 'whatsapp/', 'chatbot/', 'posts/', 'posts/new/', 'categories/', 'autopublisher/', 'pages/', 'faqs/', 'services/', 'fees/', 'testimonials/', 'partners/', 'offer/', 'media/', 'subscribers/', 'header/', 'footer/', 'design/', 'seo/', 'languages/', 'settings/', 'users/', 'profile/', 'backup/'];
for (const [name, vp] of Object.entries(VP)) {
  const ctx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true, extraHTTPHeaders: { 'x-forwarded-for': `10.1.1.${name.length}` } });
  const page = await ctx.newPage();
  let xss = false;
  page.on('dialog', async (d) => { xss = true; await d.dismiss(); });
  if (!(await adminLogin(page, 'admin@ci.local', 'ci-password-123'))) { fail('owner', 'could not sign in'); await ctx.close(); continue; }
  for (const s of SECTIONS) await visit(page, '/admin/' + s, `owner-${name}`, { strictWidth: false });
  await visit(page, '/admin/leads/', `owner-${name}`, { strictWidth: false });
  if (xss || (await page.evaluate(() => window.__xss))) fail('security', 'HTML in an enquiry name ran as code in the admin (XSS)');
  if (name === 'desktop') {
    // delete: a notification (two clicks) and the test enquiry
    await page.goto(base + '/admin/notifications/');
    const before = await page.locator('.files .row-del').count();
    if (before) {
      const b = page.locator('.files .row-del button').first();
      await b.click(); await page.locator('.cdlg button:has-text("Yes, delete")').click(); await page.waitForTimeout(1200);
      await page.goto(base + '/admin/notifications/');
      if ((await page.locator('.files .row-del').count()) !== before - 1) fail('owner', 'deleting a notification did not work');
    } else warn('owner', 'no notifications to test delete');
    await page.goto(base + '/admin/leads/?s=all');
    const leadsBefore = await page.locator('.stack > .panel').count();
    const del = page.locator('.stack > .panel').first().locator('button.btn-danger');
    if (await del.count()) { await del.click(); await page.locator('.cdlg button:has-text("Yes, delete")').click(); await page.waitForTimeout(1200); await page.goto(base + '/admin/leads/?s=all'); if ((await page.locator('.stack > .panel').count()) !== leadsBefore - 1) fail('owner', 'deleting an enquiry did not work'); }
    else fail('owner', 'no delete button on enquiries');
    await visit(page, '/contact/', 'contact'); await visit(page, '/about/', 'about');
    if (!(await page.goto(base + '/contact/').then(() => page.waitForSelector('.olive .ol-pill', { timeout: 8000 })).catch(() => null))) fail('contact', 'live office status is missing');
    const pill = await page.locator('.olive .ol-pill').innerText().catch(() => '');
    if (!/Open now|Closed/.test(pill)) fail('contact', `office status text is wrong: ${pill}`);
    await page.locator('.cp-visit').screenshot({ path: 'shots/e2e-office-live.jpg' }).catch(() => {});
    await page.goto(base + '/about/');
    const g = page.locator('.oglobe');
    if (!(await g.count())) fail('about', 'office globe is missing');
    else { await g.scrollIntoViewIfNeeded(); await page.waitForTimeout(2500); await g.screenshot({ path: 'shots/e2e-globe.jpg' }); }
    // pages: delete a built-in page (two clicks) → 404 on the site → restore → back
    const testPath = '/visa-check/';
    await page.goto(base + '/admin/pages/?q=visa-check');
    const row = page.locator('.pg-row', { hasText: testPath }).first();
    const delBtn = row.locator('button.btn-danger');
    if (!(await delBtn.count())) fail('owner', 'pages list has no Delete button');
    else {
      await delBtn.click(); await page.locator('.cdlg button:has-text("Yes, delete")').click(); await page.waitForTimeout(1200);
      const gone = await api.get(testPath).catch(() => null);
      if (!gone || gone.status() !== 404) fail('owner', `deleted page still opens (${gone && gone.status()})`);
      await page.goto(base + '/admin/pages/?t=deleted');
      const rest = page.locator('.pg-row', { hasText: testPath }).locator('button:has-text("Restore")');
      if (!(await rest.count())) fail('owner', 'deleted page is not listed under Deleted with Restore');
      else { await rest.click(); await page.waitForTimeout(1200); const back = await api.get(testPath); if (back.status() !== 200) fail('owner', `restored page does not open (${back.status()})`); }
    }
    // blog: built-in guide delete → gone from /blog/ list → restore
    await page.goto(base + '/admin/posts/');
    const gRow = page.locator('table tbody tr', { has: page.locator('.small.muted', { hasText: '/blog/' }) }).last();
    const gPath = (await gRow.locator('.small.muted').innerText().catch(() => '')).trim();
    const gDel = gRow.locator('button.btn-danger');
    if (!gPath || !(await gDel.count())) fail('owner', 'built-in blog guides have no Delete button');
    else {
      await gDel.click(); await page.locator('.cdlg button:has-text("Yes, delete")').click(); await page.waitForTimeout(1200);
      const blog = await (await api.get('/blog/')).text();
      if (blog.includes(`href="${gPath}"`)) fail('owner', `deleted guide ${gPath} is still in the blog list`);
      if ((await api.get(gPath)).status() !== 404) fail('owner', `deleted guide ${gPath} still opens`);
      await page.goto(base + '/admin/posts/');
      await page.locator('table tbody tr', { hasText: gPath }).locator('button:has-text("Restore")').click(); await page.waitForTimeout(1200);
      if ((await api.get(gPath)).status() !== 200) fail('owner', 'restored guide does not open');
    }
    // FAQs: add a new question, save, it shows on /faqs/; delete it, save, it is gone
    await page.goto(base + '/admin/faqs/');
    const faqBefore = await page.locator('.faq-ed').count();
    await page.locator('button:has-text("+ Add new FAQ")').first().click();
    await page.locator('.faq-ed').first().locator('input').fill('CI test question: can I pay in INR?');
    await page.locator('.faq-ed').first().locator('textarea').fill('CI test answer.');
    await page.locator('button:has-text("Save FAQs")').click(); await page.waitForTimeout(1500);
    if (!(await (await api.get('/faqs/')).text()).includes('CI test question')) fail('owner', 'new FAQ does not show on the FAQs page');
    await page.goto(base + '/admin/faqs/');
    if ((await page.locator('.faq-ed').count()) !== faqBefore + 1) fail('owner', 'new FAQ was not saved');
    const fdel = page.locator('.faq-ed', { has: page.locator('input[value*="CI test question"]') }).locator('button.btn-danger');
    await fdel.click(); await fdel.click();
    await page.locator('button:has-text("Save FAQs")').click(); await page.waitForTimeout(1500);
    if ((await (await api.get('/faqs/')).text()).includes('CI test question')) fail('owner', 'deleted FAQ is still on the FAQs page');
    // appointments: book on the website, then Confirm / Done / Move / Delete in admin must really change it
    const slots = await (await api.get('/api/bookings/')).json().catch(() => ({}));
    const day = (slots.days || []).find((d) => d.times?.length);
    if (!day) warn('owner', 'no free booking slot to test appointments');
    else {
      const bk = await api.post('/api/bookings/', { data: { date: day.date, time: day.times[0], name: 'CI Booker', phone: '+971500000000', email: 'ci@example.com', type: 'office' } });
      if (!bk.ok()) fail('owner', `booking on the website failed (${bk.status()})`);
      const row = () => page.locator('.file', { hasText: 'CI Booker' }).first();
      const status = async () => (await row().locator('.pill').textContent().catch(() => ''))?.trim();
      await page.goto(base + '/admin/bookings/?tab=all');
      await row().locator('button:has-text("Confirm")').click(); await page.waitForTimeout(1500); await page.reload();
      if ((await status()) !== 'Confirmed') fail('owner', `appointment Confirm did not work (status ${await status()})`);
      await row().locator('button:has-text("Done")').click(); await page.waitForTimeout(1500); await page.reload();
      if ((await status()) !== 'Done') fail('owner', `appointment Done did not work (status ${await status()})`);
      await row().locator('summary:has-text("Move")').click();
      await row().locator('input[type=time]').fill('10:30'); await row().locator('button:has-text("Save")').click(); await page.waitForTimeout(1500); await page.reload();
      if (!(await row().textContent())?.includes('10:30')) fail('owner', 'appointment Move did not change the time');
      const bdel = row().locator('button:has-text("Delete")'); await bdel.click(); await page.locator('.cdlg button:has-text("Yes, delete")').click(); await page.waitForTimeout(1500); await page.reload();
      if (await page.locator('.file', { hasText: 'CI Booker' }).count()) fail('owner', 'appointment Delete did not work');
    }
    await page.goto(base + '/');
    if (await page.locator('.dashprev').count()) fail('home', 'sample dashboard preview is still on the homepage');
    // currency: pick INR, AED prices outside the calculator change to ₹ and back
    const count = () => page.evaluate(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let aed = 0, inr = 0;
      while (w.nextNode()) { const n = w.currentNode; if (n.parentElement?.closest('[data-nofx],script,style,header')) continue; const v = n.nodeValue || ''; if (/AED\s?\d/.test(v)) aed++; if (/≈ ₹[\d,]+/.test(v)) inr++; }
      return { aed, inr };
    });
    await page.goto(base + '/golden-visa/property-investment/'); await page.waitForTimeout(800);
    const c0 = await count();
    await page.evaluate(() => { localStorage.setItem('adgv-currency', 'INR'); window.dispatchEvent(new CustomEvent('adgv:currency', { detail: 'INR' })); });
    await page.waitForTimeout(700);
    const c1 = await count();
    stats.currency = { before: c0, after: c1 };
    if (c0.aed > 0 && (c1.inr === 0 || c1.aed > 0)) fail('currency', `prices did not change to INR (${JSON.stringify({ c0, c1 })})`);
    await page.screenshot({ path: 'shots/e2e-currency-inr.jpg' });
    await page.evaluate(() => { localStorage.setItem('adgv-currency', 'AED'); window.dispatchEvent(new CustomEvent('adgv:currency', { detail: 'AED' })); });
  }
  await ctx.close();
}
stats.adminSections = SECTIONS.length * 2;

/* ---------- 5. Team: limited users only see their sections ---------- */
for (const [email, allowed, denied] of [
  ['staff-perms@ci.local', ['leads/', 'applications/'], ['users/', 'settings/', 'payments/', 'design/', 'backup/', 'customers/']],
  ['staff@ci.local', ['leads/', 'applications/'], ['users/', 'settings/', 'backup/', 'posts/', 'pages/', 'customers/', 'whatsapp/', 'chatbot/']],
  ['viewer@ci.local', [''], ['users/', 'settings/', 'backup/']],
]) {
  const ctx = await browser.newContext({ viewport: VP.mobile, extraHTTPHeaders: { 'x-forwarded-for': `10.2.2.${email.length}` } });
  const page = await ctx.newPage();
  if (!(await adminLogin(page, email, 'ci-team-pass-123'))) { fail('team', `${email} could not sign in`); await ctx.close(); continue; }
  for (const s of allowed) {
    await visit(page, '/admin/' + s, `team ${email}`, { strictWidth: false });
    if (page.url().includes('denied=1')) fail('team', `${email} was refused /admin/${s} that it should open`);
  }
  if (email === 'staff@ci.local') {
    // Nothing is assigned to this staff member: no client file or enquiry of others may show.
    await page.goto(base + '/admin/applications/');
    if (/ADGV-\d{4}/.test(await page.content())) fail('security', 'staff sees client files that are not assigned to them');
    await page.goto(base + '/admin/');
    if (/Payments received/.test(await page.content())) fail('security', 'staff dashboard shows business totals');
  }
  for (const s of denied) {
    await page.goto(base + '/admin/' + s).catch(() => {});
    await page.waitForTimeout(300);
    const u = page.url();
    if (!u.includes('denied=1') && !u.includes('/login') && u.replace(base, '').startsWith('/admin/' + s)) fail('security', `${email} could open /admin/${s} (should be blocked)`);
  }
  await ctx.close();
}

/* ---------- 6. Customers: sign up, every dashboard page, pay flow, on computer and phone ---------- */
for (const [name, vp] of Object.entries(VP)) {
  const ctx = await browser.newContext({ viewport: vp, extraHTTPHeaders: { 'x-forwarded-for': `10.3.3.${name.length}` } });
  const page = await ctx.newPage();
  await page.goto(base + '/portal/register/');
  await page.fill('#name', 'E2E Customer'); await page.fill('#email', `e2e-${name}@example.com`);
  await page.fill('#phone', '+971500000000'); await page.fill('#password', 'e2e-pass-12345');
  await Promise.all([page.waitForURL('**/portal/', { timeout: 15000 }).catch(() => {}), page.click('button[type=submit]')]);
  if (!/\/portal\/$/.test(page.url())) { fail('customer', `${name}: sign-up did not open the dashboard (${page.url()})`); await ctx.close(); continue; }
  for (const p of ['', 'files/', 'files/?tab=all', 'orders/', 'quotes/', 'invoices/', 'invoices/?f=paid', 'statement/', 'services/', 'requests/', 'calendar/', 'calendar/?m=2026-01', 'account/', `t/${T}/`])
    await visit(page, '/portal/' + p, `customer-${name}`);
  if (name === 'mobile') {
    await page.goto(base + '/portal/');
    await page.click('.cs-burger'); await page.waitForTimeout(400);
    const open = await page.evaluate(() => getComputedStyle(document.querySelector('.cs-side')).transform);
    if (open && open !== 'none' && !open.includes('1, 0, 0, 1, 0, 0')) fail('customer-mobile', 'dashboard menu does not open on the phone');
    await page.screenshot({ path: 'shots/e2e-client-menu.jpg' });
  }
  // request a service from the catalog
  await page.goto(base + '/portal/services/');
  const card = page.locator('details.svcc').first();
  if (await card.count()) {
    await card.locator('summary').click();
    await card.locator('textarea').fill('E2E test request');
    await card.locator('button[type=submit]').click(); await page.waitForTimeout(1200);
    await page.goto(base + '/portal/requests/');
    if (!(await page.locator('text=E2E test request').count()) && !(await page.locator('.orow').count())) fail('customer', 'service request did not appear in My requests');
  } else fail('customer', 'no services in Request a service');
  // signing out ends the session
  await page.goto(base + '/portal/');
  await page.click('.cs-prof summary'); await page.click('.cs-prof button[type=submit]'); await page.waitForTimeout(800);
  const after = await page.goto(base + '/portal/invoices/');
  if (!page.url().includes('/login')) fail('security', `customer still signed in after sign out (${page.url()}, ${after && after.status()})`);
  await ctx.close();
}

/* ---------- 7. Customer password reset and login lock ---------- */
{
  const page = await browser.newPage({ extraHTTPHeaders: { 'x-forwarded-for': '10.4.4.4' } });
  let locked = false;
  for (let i = 0; i < 14 && !locked; i++) {
    await page.goto(base + '/portal/login/');
    await page.fill('#email', 'e2e-desktop@example.com'); await page.fill('#password', 'wrong-pass-' + i);
    await page.click('button[type=submit]'); await page.waitForTimeout(400);
    locked = /too many|كثيرة|بہت زیادہ/i.test(await page.locator('body').innerText());
  }
  if (!locked) fail('security', 'client login is not locked after many wrong passwords');
  await page.close();
}

/* ---------- 8. Apply with a password: account created, signed in, dashboard opens; existing account never changed ---------- */
{
  const form = (pw, email) => ({ service: 'gv-property', name: 'CI Applicant', phone: '+971500000123', email, consent: 'true', where: 'in', family: '[]', password: pw });
  const a1 = await request.newContext({ baseURL: base, extraHTTPHeaders: { 'x-forwarded-for': '10.8.8.1' } });
  const r1 = await (await a1.post('/api/apply/', { multipart: form('ci-pass-12345', 'ci-apply@example.com') })).json().catch(() => ({}));
  if (!r1.ok || r1.account !== 'created') fail('apply-account', `new applicant account not created: ${JSON.stringify(r1).slice(0, 160)}`);
  const me1 = await (await a1.get('/api/me/')).json().catch(() => ({}));
  if (!me1.signedIn) fail('apply-account', 'new applicant is not signed in after applying');
  const dash = await a1.get('/portal/', { maxRedirects: 0 });
  if (dash.status() !== 200) fail('apply-account', `dashboard after applying → HTTP ${dash.status()}`);
  else if (!(await dash.text()).includes('ADGV-')) warn('apply-account', 'dashboard does not list the new application reference');
  await a1.dispose();
  const a2 = await request.newContext({ baseURL: base, extraHTTPHeaders: { 'x-forwarded-for': '10.8.8.2' } });
  const r2 = await (await a2.post('/api/apply/', { multipart: form('a-wrong-password', 'ci-apply@example.com') })).json().catch(() => ({}));
  if (!r2.ok || r2.account !== 'exists') fail('apply-account', `existing email with wrong password: ${JSON.stringify(r2).slice(0, 160)}`);
  if ((await (await a2.get('/api/me/')).json().catch(() => ({}))).signedIn) fail('security', 'wrong password on apply signed the visitor in');
  const r3 = await (await a2.post('/api/apply/', { multipart: form('ci-pass-12345', 'ci-apply@example.com') })).json().catch(() => ({}));
  if (r3.account !== 'signed-in') fail('apply-account', `existing account with the right password not signed in: ${JSON.stringify(r3).slice(0, 160)}`);
  await a2.dispose();
}

await browser.close();
const report = { ok: fails.length === 0, fails, warns: [...new Set(warns)].slice(0, 200), stats };
writeFileSync('shots/e2e-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (fails.length) process.exit(1);
