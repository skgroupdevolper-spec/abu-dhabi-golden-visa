// Live check of the public websites (run by .github/workflows/live-audit.yml).
// For every page in each sitemap: HTTP status, browser errors, failed files, broken or blurry images,
// sideways scrolling on phones, and every internal link. Writes audit/report.json + report.md and screenshots.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const SITES = (process.env.SITES || 'https://www.abudhabigoldenvisa.com,https://familyvisauae.com').split(',');
const EXTRA = (process.env.EXTRA || 'https://app.abudhabigoldenvisa.com/login/,https://app.abudhabigoldenvisa.com/register/,https://app.abudhabigoldenvisa.com/forgot/,https://app.familyvisauae.com/login/,https://app.familyvisauae.com/register/,https://app.familyvisauae.com/forgot/,https://app.abudhabigoldenvisa.com/apply/,https://app.familyvisauae.com/apply/').split(',').filter(Boolean);
const MAX = Number(process.env.MAX_PAGES || 400);
const LANGS_TOO = process.env.LANGS === '1';
const OUT = 'audit';
fs.mkdirSync(`${OUT}/shots`, { recursive: true });

const PROFILES = {
  phoneS: { ...devices['iPhone SE'] },
  phone: { ...devices['Pixel 7'] },
  tablet: { ...devices['iPad Mini'] },
  desktop: { viewport: { width: 1440, height: 900 } },
};

async function sitemapUrls(site) {
  const seen = new Set();
  const out = [];
  async function read(u, depth = 0) {
    if (seen.has(u) || depth > 3) return; seen.add(u);
    const r = await fetch(u).catch(() => null);
    if (!r || !r.ok) return;
    const x = await r.text();
    const locs = [...x.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    if (/<sitemapindex/i.test(x)) for (const l of locs) await read(l, depth + 1);
    else out.push(...locs);
  }
  await read(`${site}/sitemap.xml`);
  let urls = [...new Set(out)];
  if (!LANGS_TOO) {
    const en = urls.filter((u) => !/^https?:\/\/[^/]+\/(ar|ru|tr|zh|fr|de|it|es|ro|pt|pl|hu|hr|sk|cs|hi|id|ur|at|fa|ja|ko|bn|tl|ml|ta|si|ne)(\/|$)/.test(u));
    // keep the home page of each language
    const homes = urls.filter((u) => /^https?:\/\/[^/]+\/[a-z]{2}\/?$/.test(u));
    urls = [...new Set([...en, ...homes])];
  }
  if (!urls.length) urls = [`${site}/`];
  return urls.slice(0, MAX);
}

const issues = [];
const add = (site, page, device, kind, detail) => issues.push({ site, page, device, kind, detail: String(detail).slice(0, 400) });

const linkStatus = new Map();
async function checkLink(u) {
  if (linkStatus.has(u)) return linkStatus.get(u);
  let st = 0;
  try {
    let r = await fetch(u, { method: 'HEAD', redirect: 'follow' });
    if (r.status === 405 || r.status === 403) r = await fetch(u, { redirect: 'follow' });
    st = r.status;
  } catch { st = -1; }
  linkStatus.set(u, st);
  return st;
}

async function auditPage(browser, site, url, device, { shot = false, links = false } = {}) {
  const ctx = await browser.newContext({ ...PROFILES[device], ignoreHTTPSErrors: false });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(`JS error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|google|gtag|facebook|doubleclick|clarity|hotjar|Failed to load resource/i.test(m.text())) errs.push(`console: ${m.text()}`); });
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && !/google|facebook|doubleclick|clarity|gtag|analytics/i.test(u)) errs.push(`file ${r.status()}: ${u}`);
  });
  page.on('requestfailed', (r) => { const u = r.url(); if (!/google|facebook|doubleclick|clarity|analytics|gtag/i.test(u) && !/ERR_ABORTED/.test(r.failure()?.errorText || '')) errs.push(`failed: ${u} ${r.failure()?.errorText}`); });
  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => page.goto(url, { waitUntil: 'load', timeout: 45000 }));
    status = resp?.status() ?? 0;
  } catch (e) { add(site, url, device, 'page did not load', e.message); await ctx.close(); return []; }
  if (status >= 400) add(site, url, device, `page HTTP ${status}`, url);
  await page.waitForTimeout(800);
  // scroll down to trigger lazy images
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const out = { overflow: [], broken: [], blurry: [], noalt: 0, links: [], title: document.title, h1: document.querySelectorAll('h1').length, desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '', empty: [] };
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 2) {
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect();
        if (b.width && (b.right > vw + 2) && getComputedStyle(el).position !== 'fixed') {
          let p = el.parentElement, clipped = false;
          while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') { clipped = true; break; } p = p.parentElement; }
          if (!clipped) out.overflow.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''} (right ${Math.round(b.right)} > ${vw})`);
          if (out.overflow.length > 5) break;
        }
      }
      if (!out.overflow.length) out.overflow.push(`page is ${document.documentElement.scrollWidth}px wide on a ${vw}px screen`);
    }
    for (const img of document.images) {
      const b = img.getBoundingClientRect();
      if (!img.complete || (img.naturalWidth === 0 && img.currentSrc)) { if (b.width > 0 || img.loading !== 'lazy') out.broken.push(img.currentSrc || img.src); continue; }
      const dpr = window.devicePixelRatio || 1;
      if (b.width > 60 && img.naturalWidth && img.naturalWidth * 1.35 < b.width * Math.min(dpr, 2) && !/\.svg/i.test(img.currentSrc)) out.blurry.push(`${(img.currentSrc || img.src).split('?')[0]} (file ${img.naturalWidth}px, shown ${Math.round(b.width)}px @${dpr}x)`);
      if (!img.hasAttribute('alt')) out.noalt++;
    }
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href');
      if (!h || h.startsWith('#') || /^(mailto|tel|javascript|whatsapp|sms):/i.test(h)) continue;
      try { out.links.push(new URL(h, location.href).href.split('#')[0]); } catch {}
      const b = a.getBoundingClientRect();
      if (b.width > 0 && !a.textContent.trim() && !a.querySelector('img,svg') && !a.getAttribute('aria-label')) out.empty.push(h);
    }
    return out;
  });
  for (const e of [...new Set(errs)].slice(0, 8)) add(site, url, device, 'error', e);
  for (const o of r.overflow) add(site, url, device, 'sideways scroll', o);
  for (const b of [...new Set(r.broken)].slice(0, 5)) add(site, url, device, 'broken image', b);
  for (const b of [...new Set(r.blurry)].slice(0, 5)) add(site, url, device, 'blurry image', b);
  if (device === 'desktop') {
    if (!r.title) add(site, url, device, 'SEO', 'no <title>');
    if (r.h1 !== 1 && !/\/(login|register|forgot|apply)\//.test(url)) add(site, url, device, 'SEO', `${r.h1} <h1> on page`);
  }
  if (shot) await page.screenshot({ path: `${OUT}/shots/${device}-${url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 80)}.png` });
  await ctx.close();
  return links ? r.links : [];
}

const browser = await chromium.launch();
const summary = {};
for (const site of SITES) {
  const host = new URL(site).host.replace(/^www\./, '');
  const urls = await sitemapUrls(site);
  summary[site] = { pages: urls.length };
  console.log(`${site}: ${urls.length} pages`);
  const allLinks = new Set();
  const keyPages = new Set([urls[0], ...urls.filter((u) => /\/(contact|apply|visa-check|golden-visa-cost|blog|services|about|faq)/.test(u)).slice(0, 6)]);
  let i = 0;
  const queue = [...urls];
  async function worker() {
    while (queue.length) {
      const u = queue.shift(); i++;
      const ls = await auditPage(browser, site, u, 'phone', { links: true, shot: keyPages.has(u) });
      ls.forEach((l) => allLinks.add(l));
      await auditPage(browser, site, u, 'desktop', { shot: keyPages.has(u) });
      if (keyPages.has(u)) { await auditPage(browser, site, u, 'phoneS', { shot: true }); await auditPage(browser, site, u, 'tablet', { shot: true }); }
      if (i % 20 === 0) console.log(`  ${i}/${urls.length}`);
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  // check every internal link found
  const internal = [...allLinks].filter((l) => { try { return new URL(l).host.replace(/^www\./, '').endsWith(host); } catch { return false; } });
  summary[site].links = internal.length;
  const lq = [...internal];
  await Promise.all(Array.from({ length: 8 }, async () => { while (lq.length) { const l = lq.shift(); const st = await checkLink(l); if (st >= 400 || st < 0) add(site, l, '-', `broken link (${st})`, l); } }));
}
for (const u of EXTRA) {
  const site = new URL(u).origin;
  for (const d of ['phoneS', 'phone', 'tablet', 'desktop']) await auditPage(browser, site, u, d, { shot: true });
}
await browser.close();

// group: same problem on many pages counts once with a page count
const groups = new Map();
for (const x of issues) {
  const key = `${x.site}|${x.kind}|${x.detail.replace(/https?:\/\/[^\s]+\/(ar|ru|tr|zh|fr|de|it|es|ro|pt|pl|hu|hr|sk|cs|hi|id|ur)\//, '/xx/')}`;
  const g = groups.get(key) || { site: x.site, kind: x.kind, detail: x.detail, devices: new Set(), pages: new Set() };
  g.devices.add(x.device); g.pages.add(x.page); groups.set(key, g);
}
const list = [...groups.values()].map((g) => ({ ...g, devices: [...g.devices], pages: [...g.pages] })).sort((a, b) => b.pages.length - a.pages.length);
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify({ summary, issues: list }, null, 1));
let md = `# Live audit\n\n${Object.entries(summary).map(([s, v]) => `- ${s}: ${v.pages} pages, ${v.links ?? 0} internal links`).join('\n')}\n\nIssues: ${list.length}\n\n`;
for (const g of list) md += `- **${g.kind}** [${g.devices.join(',')}] ${g.site} — ${g.detail}  \n  pages (${g.pages.length}): ${g.pages.slice(0, 4).join(' , ')}\n`;
fs.writeFileSync(`${OUT}/report.md`, md);
console.log(md.slice(0, 6000));
