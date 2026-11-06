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
const IGNORE = /favicon|ERR_ABORTED|net::ERR_|Failed to load resource|Download the React DevTools|ResizeObserver/i;

const api = await request.newContext({ baseURL: base });
const browser = await chromium.launch({ channel: 'chrome' });

/** Opens a page, records crashes, console errors, broken images and sideways scrolling. */
async function visit(page, url, area, { strictWidth = true } = {}) {
  const errs = [];
  const onErr = (e) => errs.push('pageerror: ' + e.message);
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
    for (const u of sample) await visit(page, u, `visitor-${name}`);
    // phone menu opens
    if (name === 'mobile') {
      await page.goto(base + '/');
      const burger = page.locator('header button[aria-label*="enu" i], header .burger, header .menu-btn').first();
      if (await burger.count()) { await burger.click().catch(() => {}); await page.waitForTimeout(500); await page.screenshot({ path: 'shots/e2e-mobile-menu.jpg' }); }
      else warn('visitor-mobile', 'no menu button found in the header');
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
  await ctx.close();
}
stats.adminSections = SECTIONS.length * 2;

/* ---------- 5. Team: limited users only see their sections ---------- */
for (const [email, allowed, denied] of [
  ['staff-perms@ci.local', ['leads/', 'applications/'], ['users/', 'settings/', 'payments/', 'design/', 'backup/', 'customers/']],
  ['staff@ci.local', ['leads/', 'applications/'], ['users/', 'settings/', 'backup/']],
  ['viewer@ci.local', [''], ['users/', 'settings/', 'backup/']],
]) {
  const ctx = await browser.newContext({ viewport: VP.mobile, extraHTTPHeaders: { 'x-forwarded-for': `10.2.2.${email.length}` } });
  const page = await ctx.newPage();
  if (!(await adminLogin(page, email, 'ci-team-pass-123'))) { fail('team', `${email} could not sign in`); await ctx.close(); continue; }
  for (const s of allowed) {
    await visit(page, '/admin/' + s, `team ${email}`, { strictWidth: false });
    if (page.url().includes('denied=1')) fail('team', `${email} was refused /admin/${s} that it should open`);
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

await browser.close();
const report = { ok: fails.length === 0, fails, warns: [...new Set(warns)].slice(0, 200), stats };
writeFileSync('shots/e2e-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (fails.length) process.exit(1);
