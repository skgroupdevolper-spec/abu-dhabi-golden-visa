// CI only: the page builder's design panel and live preview, on the homepage and on a normal page.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('shots', { recursive: true });
const BASE = 'http://localhost:3000';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1600, height: 1000 } });
const p = await c.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('dialog', (d) => d.accept());
await p.goto(`${BASE}/admin/login/`, { waitUntil: 'networkidle' });
await p.fill('#email', process.env.ADMIN_EMAIL); await p.fill('#password', process.env.ADMIN_PASSWORD);
await Promise.all([p.waitForURL(/\/admin\/(?!login)/, { timeout: 30000 }), p.click('button[type=submit]')]);

const frameStyle = (sel, prop) => p.frameLocator('.pb-preview iframe').locator(sel).first().evaluate((el, prop) => getComputedStyle(el)[prop], prop).catch((e) => `err ${e.message.slice(0, 80)}`);

// ---- homepage: design, order
await p.goto(`${BASE}/admin/pages/edit/?path=%2F`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const row = p.locator('.home-part-w').filter({ hasText: 'Visa routes cards' });
await row.locator('button[aria-label=Design]').click();
await p.waitForTimeout(400);
await row.locator('.dp select').first().selectOption('color');
await row.locator('.dp .dp-color input[type=text]').first().fill('#123456');
await row.locator('.dp input[type=range]').nth(2).evaluate((el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '120'); el.dispatchEvent(new Event('input', { bubbles: true })); });
await row.locator('button[aria-label="Move up"]').click();
await p.waitForTimeout(900);
console.log('home preview routes bg:', await frameStyle('.home [data-hs="routes"]>section', 'backgroundColor'));
console.log('home preview routes order:', await frameStyle('.home [data-hs="routes"]>section', 'order'), 'flex:', await frameStyle('.home', 'display'));
await p.screenshot({ path: 'shots/pb-home-design.png' });
await p.click('button.btn-gold:has-text("Save")');
await p.waitForTimeout(2500);
console.log('home save:', await p.locator('.notice').first().textContent().catch(() => 'no notice'));
const pub = await c.newPage();
await pub.goto(`${BASE}/`, { waitUntil: 'networkidle' });
console.log('live home routes bg:', await pub.locator('.home [data-hs="routes"]>section').first().evaluate((el) => getComputedStyle(el).backgroundColor + ' pad ' + getComputedStyle(el).paddingTop + ' order ' + getComputedStyle(el).order));
await pub.screenshot({ path: 'shots/pb-home-live.png', fullPage: false });

// ---- a normal page: save once (sections become blocks), then design one block
await p.goto(`${BASE}/admin/pages/edit/?path=%2Fgolden-visa%2F`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.click('button.btn-gold:has-text("Save")');
await p.waitForTimeout(2500);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.locator('.pb-row').nth(1).locator('button[aria-label=Design]').click();
await p.waitForTimeout(500);
await p.locator('.pb-edit .dp select').first().selectOption('gradient');
await p.locator('.pb-edit .dp .dp-color input[type=text]').nth(0).fill('#0d0d0d');
await p.locator('.pb-edit .dp .dp-color input[type=text]').nth(1).fill('#8a6a12');
await p.locator('.pb-edit .dp .dp-color input[type=text]').nth(2).fill('#ffffff');
await p.waitForTimeout(900);
const bid = await p.frameLocator('.pb-preview iframe').locator('[data-bid]').nth(1).getAttribute('data-bid').catch(() => '');
console.log('page preview block', bid, 'bg:', await frameStyle(`[data-bid="${bid}"]`, 'backgroundImage'));
await p.screenshot({ path: 'shots/pb-page-design.png' });
await p.click('button.btn-gold:has-text("Save")');
await p.waitForTimeout(2500);
await pub.goto(`${BASE}/golden-visa/`, { waitUntil: 'networkidle' });
console.log('live page block bg:', await pub.locator(`[data-bid="${bid}"]`).first().evaluate((el) => getComputedStyle(el).backgroundImage.slice(0, 80) + ' h2 ' + getComputedStyle(el.querySelector('h2') || el).color).catch((e) => 'err ' + e.message.slice(0, 80)));
await pub.locator(`[data-bid="${bid}"]`).first().scrollIntoViewIfNeeded().catch(() => {});
await pub.screenshot({ path: 'shots/pb-page-live.png' });

// phone view of the editor
await p.setViewportSize({ width: 390, height: 844 });
await p.goto(`${BASE}/admin/pages/edit/?path=%2F`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.locator('.home-part-w').first().locator('button[aria-label=Design]').click().catch(() => {});
await p.waitForTimeout(500);
await p.screenshot({ path: 'shots/pb-phone.png', fullPage: false });
await b.close();
console.log('page errors:', errors);
