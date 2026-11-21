import 'server-only';
// Search engines hear about a new article through IndexNow (the website's own key).
export async function pingIndexNow(paths: string[]) {
  const m = await import('../../indexnow');
  const r = await m.pingIndexNow([...paths, '/blog/']).catch(() => null);
  return { ok: !!r, count: paths.length };
}
