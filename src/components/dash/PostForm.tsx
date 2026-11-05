'use client';

// Blog post editor: writing with a toolbar and preview, cover image, category, tags, SEO and scheduling.
import { useState } from 'react';
import { ActionForm, Submit } from './ActionForm';
import { MediaPicker } from './MediaPicker';
import { RichEditor } from './RichEditor';
import { Icon } from '@/components/Icon';

type P = { id?: string; title?: string; slug?: string; status?: string; meta?: string; summary?: string; body?: string; faq?: string; author?: string; reviewer?: string; cover?: string; coverAlt?: string; category?: string; tags?: string; seoTitle?: string; ogImage?: string; canonical?: string; noindex?: boolean; scheduledAt?: string; featured?: boolean; keyword?: string };

function mdLite(s: string) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return esc.split(/\n{2,}/).map((b) => {
    if (/^### /.test(b)) return `<h3>${b.slice(4)}</h3>`;
    if (/^## /.test(b)) return `<h2>${b.slice(3)}</h2>`;
    if (/^(- |\* )/m.test(b)) return `<ul>${b.split('\n').map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')}</ul>`;
    return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[(.+?)\]\((.+?)\)/g, '<a>$1</a>').replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

export function PostForm({ p, categories, action }: { p: P; categories: { slug: string; name: string }[]; action: (s: { ok?: string; error?: string } | undefined, f: FormData) => Promise<{ ok?: string; error?: string } | undefined> }) {
  const [v, setV] = useState<P>(p);
  const [tab, setTab] = useState<'visual' | 'write' | 'preview'>(!p.body || /^\s*</.test(p.body) ? 'visual' : 'write');
  const set = (k: keyof P, x: unknown) => setV((o) => ({ ...o, [k]: x }));
  const title = v.seoTitle || `${v.title ?? ''} | Abu Dhabi Golden Visa`;
  const meta = v.meta || v.summary || '';
  const kw = (v.keyword ?? '').toLowerCase();
  const words = (v.body ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const checks = [
    { ok: title.length >= 30 && title.length <= 62, t: `SEO title ${title.length} characters (30–62)` },
    { ok: meta.length >= 110 && meta.length <= 160, t: `Description ${meta.length} characters (110–160)` },
    { ok: !!v.cover, t: 'Cover image added' },
    { ok: !!v.category, t: 'Category chosen' },
    { ok: words >= 600, t: `${words} words (600+ recommended)` },
    { ok: !kw || (v.title ?? '').toLowerCase().includes(kw), t: 'Focus keyword in the title' },
    { ok: !kw || meta.toLowerCase().includes(kw), t: 'Focus keyword in the description' },
    { ok: /\]\(\/|href="\//.test(v.body ?? ''), t: 'Links to other pages of the site' },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const insert = (a: string, b = '') => { set('body', `${v.body ?? ''}${(v.body ?? '').endsWith('\n') || !v.body ? '' : '\n\n'}${a}${b}`); };

  return (
    <ActionForm action={action} className="post-ed">
      <input type="hidden" name="id" value={v.id ?? ''} />
      <input type="hidden" name="cover" value={v.cover ?? ''} />
      <input type="hidden" name="ogImage" value={v.ogImage ?? ''} />
      <div className="post-main">
        <div className="panel">
          <input className="post-title" name="title" value={v.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="Article title" aria-label="Title" />
          <div className="field" style={{ marginTop: 10 }}><label>Summary (under the title and on cards)</label><textarea name="summary" rows={2} value={v.summary ?? ''} onChange={(e) => set('summary', e.target.value)} /></div>
          <div className="md" style={{ marginTop: 12 }}>
            <div className="md-bar">
              <button type="button" className={tab === 'visual' ? 'on' : ''} onClick={() => setTab('visual')}>Visual</button>
              <button type="button" className={tab === 'write' ? 'on' : ''} onClick={() => setTab('write')}>Markdown</button>
              <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>Preview</button>
              <span style={{ width: 10 }} />
              <button type="button" onClick={() => insert('## Heading')}>H2</button><button type="button" onClick={() => insert('### Heading')}>H3</button>
              <button type="button" onClick={() => insert('- Item one\n- Item two')}>• List</button><button type="button" onClick={() => insert('[link text](/apply/)')}>Link</button>
              <button type="button" onClick={() => insert('**bold text**')}><b>B</b></button><button type="button" onClick={() => insert('> Important note')}>Quote</button>
              <button type="button" onClick={() => insert('![image description](/media/your-image.webp)')}>Image</button>
              <span className="muted small" style={{ marginInlineStart: 'auto', padding: '0 8px' }}>{words} words</span>
            </div>
            {tab === 'visual'
              ? <><input type="hidden" name="body" value={v.body ?? ''} /><RichEditor value={v.body ?? ''} onChange={(h) => set('body', h)} /></>
              : tab === 'write'
              ? <textarea name="body" rows={22} value={v.body ?? ''} onChange={(e) => set('body', e.target.value)} placeholder="Write the article. Use ## for headings, - for lists and [text](/page/) for links." />
              : <><input type="hidden" name="body" value={v.body ?? ''} /><div className="post-prev" dangerouslySetInnerHTML={{ __html: mdLite(v.body ?? '') }} /></>}
          </div>
          <div className="field" style={{ marginTop: 12 }}><label>FAQs (question on the first line, answer below, blank line between)</label><textarea name="faq" rows={6} value={v.faq ?? ''} onChange={(e) => set('faq', e.target.value)} /></div>
        </div>
        <div className="panel">
          <div className="panel-h"><h2>SEO</h2><span className={`score s${score >= 80 ? 'g' : score >= 50 ? 'm' : 'b'}`}>{score}%</span></div>
          <div className="pb-seo">
            <div className="pb-fields">
              <div className="field"><label>Focus keyword</label><input name="keyword" value={v.keyword ?? ''} onChange={(e) => set('keyword', e.target.value)} /></div>
              <div className="field"><label>SEO title (empty = article title)</label><input name="seoTitle" value={v.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} /></div>
              <div className="field"><label>Meta description</label><textarea name="meta" rows={3} value={v.meta ?? ''} onChange={(e) => set('meta', e.target.value)} /></div>
              <div className="field"><label>Web address</label><input name="slug" value={v.slug ?? ''} onChange={(e) => set('slug', e.target.value)} placeholder="made from the title" /></div>
              <div className="field"><label>Social sharing image (empty = cover)</label><MediaPicker value={v.ogImage ?? ''} onChange={(u) => set('ogImage', u)} /></div>
              <div className="field"><label>Canonical link (optional)</label><input name="canonical" value={v.canonical ?? ''} onChange={(e) => set('canonical', e.target.value)} /></div>
              <label className="switch"><input type="checkbox" name="noindex" checked={!!v.noindex} onChange={(e) => set('noindex', e.target.checked)} /><span><b>Hide from Google (noindex)</b></span></label>
            </div>
            <div>
              <div className="serp"><small>www.abudhabigoldenvisa.com › blog › {v.slug || 'your-article'}</small><b>{title.slice(0, 62)}</b><p>{meta.slice(0, 160)}</p></div>
              <ul className="checks" style={{ marginTop: 12 }}>{checks.map((c) => <li key={c.t} className={c.ok ? 'ok' : 'no'}><Icon name={c.ok ? 'check' : 'close'} size={14} /> {c.t}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
      <aside className="post-side">
        <div className="panel">
          <h3>Publish</h3>
          <div className="field" style={{ marginTop: 10 }}><label>Status</label><select name="status" value={v.status ?? 'draft'} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="review">Needs review</option><option value="published">Published</option></select></div>
          <div className="field" style={{ marginTop: 10 }}><label>Publish date (optional, for scheduling)</label><input type="datetime-local" name="scheduledAt" value={v.scheduledAt ?? ''} onChange={(e) => set('scheduledAt', e.target.value)} /></div>
          <label className="switch" style={{ marginTop: 10 }}><input type="checkbox" name="featured" checked={!!v.featured} onChange={(e) => set('featured', e.target.checked)} /><span><b>Feature at the top of the blog</b></span></label>
          <div style={{ marginTop: 12 }}><Submit>Save article</Submit></div>
        </div>
        <div className="panel">
          <h3>Cover image</h3>
          <div style={{ marginTop: 10 }}><MediaPicker value={v.cover ?? ''} onChange={(u, alt) => { set('cover', u); if (alt && !v.coverAlt) set('coverAlt', alt); }} /></div>
          {v.cover && <img src={v.cover} alt="" className="post-cover" />}
          <div className="field" style={{ marginTop: 10 }}><label>Image alt text</label><input name="coverAlt" value={v.coverAlt ?? ''} onChange={(e) => set('coverAlt', e.target.value)} /></div>
        </div>
        <div className="panel">
          <h3>Category &amp; tags</h3>
          <div className="field" style={{ marginTop: 10 }}><label>Category</label><select name="category" value={v.category ?? ''} onChange={(e) => set('category', e.target.value)}><option value="">No category</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
          <div className="field" style={{ marginTop: 10 }}><label>Tags (comma separated)</label><input name="tags" value={v.tags ?? ''} onChange={(e) => set('tags', e.target.value)} /></div>
        </div>
        <div className="panel">
          <h3>Author</h3>
          <div className="field" style={{ marginTop: 10 }}><label>Author</label><input name="author" value={v.author ?? ''} onChange={(e) => set('author', e.target.value)} /></div>
          <div className="field" style={{ marginTop: 10 }}><label>Reviewed by</label><input name="reviewer" value={v.reviewer ?? ''} onChange={(e) => set('reviewer', e.target.value)} /></div>
          <p className="help" style={{ marginTop: 8 }}>No promises of guaranteed approval or fixed timelines; confirm fees against official sources.</p>
        </div>
      </aside>
    </ActionForm>
  );
}
