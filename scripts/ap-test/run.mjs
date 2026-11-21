// CI only: signs in to the dashboard, creates a mission, has the Auto Publisher write one article in
// dry-run mode (AUTOPUBLISHER_FAKE_AI=1, no AI cost) and checks the article on the blog.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
mkdirSync('shots', { recursive: true });
const BASE = 'http://localhost:3000';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`${BASE}/admin/login/`, { waitUntil: 'networkidle' });
await p.fill('#email', process.env.ADMIN_EMAIL); await p.fill('#password', process.env.ADMIN_PASSWORD);
await Promise.all([p.waitForURL(/\/admin\/(?!login)/, { timeout: 30000 }), p.click('button[type=submit]')]);
// Requests are made from inside the signed-in page (same cookies and host as the dashboard).
const api = async (path, method = 'GET', data) => {
  const r = await p.evaluate(async ([url, method, data]) => {
    const res = await fetch(url, { method, headers: data ? { 'Content-Type': 'application/json' } : undefined, body: data ? JSON.stringify(data) : undefined });
    return { status: res.status, ok: res.ok, j: await res.json().catch(() => ({})) };
  }, [`/api/admin/autopublisher${path}`, method, data]);
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(r.j)}`);
  return r.j;
};
const st = await api('');
console.log('status:', st.status.state, 'fake:', st.status.fakeAi);
const m = await api('/missions', 'POST', { name: 'CI mission', active: true, publishMode: 'publish', focus: 'Abu Dhabi Golden Visa for property investors', keywords: 'abu dhabi golden visa property investor documents\ngolden visa off-plan property abu dhabi', minWords: 800, maxWords: 1500, markets: ['AE'], languages: ['en'], nativeLanguages: [] });
const missionId = m.item?.id || m.id || (await api('/missions')).items[0].id;
const w = await api('/jobs', 'POST', { action: 'write', missionId });
console.log('job:', w.jobId);
let job;
for (let i = 0; i < 90; i++) {
  await p.waitForTimeout(4000);
  const list = await api('/jobs');
  job = [...(list.active || []), ...(list.recent || [])].find((j) => j.id === w.jobId);
  if (job && ['done', 'held', 'failed'].includes(job.stage)) break;
  if (job && i % 5 === 0) console.log('…', job.stage, job.error || '');
  if (job && !['done', 'held', 'failed'].includes(job.stage) && i % 3 === 2) await api('/jobs', 'POST', { action: 'step', jobId: w.jobId }).catch(() => {});
}
console.log('final stage:', job?.stage, job?.error || '');
const logs = await api('/logs');
for (const l of (logs.items || []).slice(0, 40).reverse()) console.log(`  [${l.level}] ${l.message}`);
for (const [tab, name] of [['Overview', 'overview'], ['Missions', 'missions'], ['Review queue', 'review'], ['Keywords', 'keywords'], ['Company knowledge', 'knowledge'], ['AI & pictures', 'ai'], ['Photo library', 'photos'], ['Quality & SEO', 'quality'], ['Similarity report', 'report'], ['Logs', 'logs']]) {
  await p.goto(`${BASE}/admin/autopublisher/`, { waitUntil: 'networkidle' }).catch(() => {});
  await p.getByRole('button', { name: tab }).first().click().catch(() => {});
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/ap-${name}.png`, fullPage: true });
}
await p.setViewportSize({ width: 390, height: 844 });
await p.goto(`${BASE}/admin/autopublisher/`, { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/ap-phone.png', fullPage: true });
const posts = JSON.parse(readFileSync('data/posts.json', 'utf8')).filter((x) => x.source === 'auto');
const saved = posts[0];
console.log('articles saved:', posts.length);
if (saved) {
  console.log(JSON.stringify({ ...saved, body: String(saved.body).slice(0, 600), revisions: undefined }, null, 1));
  await p.setViewportSize({ width: 1440, height: 900 });
  const r = await p.goto(`${BASE}/blog/${saved.slug}/`, { waitUntil: 'networkidle' }).catch(() => null);
  console.log('blog page:', r?.status());
  await p.screenshot({ path: 'shots/ap-article.png', fullPage: true });
  if (saved.cover) { const c = await p.goto(`${BASE}${saved.cover}`).catch(() => null); console.log('cover:', saved.cover, c?.status()); }
}
await b.close();
console.log('page errors:', errors);
if (!saved || job?.stage !== 'done') process.exit(1);
