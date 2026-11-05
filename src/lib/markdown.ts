// Small, safe Markdown renderer for blog posts and page additions (no raw HTML allowed).
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
}
export function md(src: string): string {
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null, para: string[] = [];
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of src.replace(/\r/g, '').split('\n')) {
    const l = raw.trimEnd();
    const h = l.match(/^(#{2,4})\s+(.*)/), ul = l.match(/^\s*[-*]\s+(.*)/), ol = l.match(/^\s*\d+[.)]\s+(.*)/);
    if (!l.trim()) { flushP(); flushL(); continue; }
    if (h) { flushP(); flushL(); const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (ul || ol) { flushP(); const k = ul ? 'ul' : 'ol'; if (list !== k) { flushL(); out.push(`<${k}>`); list = k; } out.push(`<li>${inline((ul ?? ol)![1])}</li>`); continue; }
    if (l.startsWith('> ')) { flushP(); flushL(); out.push(`<blockquote>${inline(l.slice(2))}</blockquote>`); continue; }
    flushL(); para.push(l.trim());
  }
  flushP(); flushL();
  return out.join('\n');
}
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);
