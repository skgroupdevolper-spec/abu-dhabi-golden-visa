import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { aiReady } from '@/lib/server/ai';
import { AP0, type AutoPub } from '@/lib/server/autopub';
import { list } from '@/lib/server/collections';
import { getCategories } from '@/lib/server/content';
import type { Post } from '@/lib/server/content';
import { getBlock } from '@/lib/server/settings';
import type { AiLog } from '@/lib/server/translate';
import { SITE } from '@/lib/site';
import { when } from '@/lib/stages';
import { draftNow, saveAutopub, suggestKeywordsNow } from '../../ai-actions';

export const metadata: Metadata = { title: 'Auto Publisher' };

export default async function AutoPublisher() {
  await requireAdmin(FULL);
  const [cfg, ready, posts, logs, cats] = await Promise.all([getBlock<AutoPub>('autopub', AP0), aiReady(), list<Post>('posts'), list<AiLog>('ai-log'), getCategories()]);
  const kws = cfg.keywords.split('\n').map((k) => k.trim()).filter(Boolean);
  const queue = posts.filter((p) => p.status === 'review');
  const left = cfg.keywords.split('\n').map((k) => k.trim()).filter((k) => k && !cfg.used.includes(k)).length;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Auto Publisher</p><h1>Auto Publisher</h1><p className="muted small" style={{ marginTop: 6 }}>Writes original, SEO-ready articles with category, tags, cover image and FAQs, then queues them for your review.</p></div>
        <span className={`pill ${cfg.on && ready ? 'ok' : 'due'}`}>{!ready ? 'No AI key' : cfg.on ? 'On' : 'Off'}</span></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Review queue</small><b>{queue.length}</b><Link className="small" href="/admin/posts/?s=review">Open queue →</Link></div>
        <div className="kpi"><small>Published by Auto Publisher</small><b>{posts.filter((p) => p.source === 'auto' && p.status === 'published').length}</b></div>
        <div className="kpi"><small>Keywords left</small><b>{left}</b></div>
        <div className="kpi goldbg"><small>Last run</small><b style={{ fontSize: 20 }}>{cfg.lastRun ? when(cfg.lastRun) : 'Never'}</b></div>
      </div>
      <div className="cols">
        <div className="panel">
          <ActionForm action={saveAutopub} className="form">
            <div className="full"><Toggle name="on" label="Master switch" help="Runs with the daily scheduled job." on={cfg.on} /></div>
            <F name="perWeek" label="Articles per week" value={cfg.perWeek} type="number" />
            <F name="words" label="Length (words)" value={cfg.words} type="number" />
            <div className="full"><Toggle name="review" label="Review before publishing (recommended)" help="Articles wait in the review queue until you publish them." on={cfg.review} /></div>
            <F name="tone" label="Tone" value={cfg.tone} full />
            <F name="audience" label="Audience (who you write for)" value={cfg.audience} placeholder="Investors, professionals and families moving to Abu Dhabi" full />
            <div className="field"><label htmlFor="category">Category</label><select id="category" name="category" defaultValue={cfg.category ?? ''}><option value="">Let the AI choose</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            <F name="faqCount" label="FAQs per article" value={cfg.faqCount ?? 4} type="number" />
            <F name="covers" label="Cover images (one link per line, used in turn; copy links from Media library)" value={cfg.covers} type="textarea" rows={3} full />
            <F name="keywords" label="Keywords and topics (one per line)" value={cfg.keywords} type="textarea" rows={8} full help="Each keyword becomes one article. Used keywords are skipped." />
            <div className="full"><span className="lbl">Quality gates (articles that fail stay as drafts)</span></div>
            <F name="minWords" label="Minimum words" value={cfg.minWords ?? 600} type="number" />
            <F name="maxSimilarity" label="Maximum similarity to your posts (%)" value={cfg.maxSimilarity ?? 35} type="number" />
            <F name="banned" label="Blocked phrases (one per line)" value={cfg.banned ?? 'guaranteed approval\n100% approval\nguarantee'} type="textarea" rows={3} full />
            <div className="full"><Toggle name="requireFaq" label="Every article must have FAQs" on={cfg.requireFaq ?? true} /></div>
            <div className="full"><Toggle name="aiCovers" label="Create an original AI cover image when no cover is set (OpenAI key)" help="Abu Dhabi scenes in white and gold, with no text, logos or government emblems." on={!!cfg.aiCovers} /></div>
            <F name="knowledge" label="Company knowledge for the writer" value={cfg.knowledge} type="textarea" rows={4} full />
            <label className="row small full"><input type="checkbox" name="resetUsed" /> Allow used keywords again</label>
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        </div>
        <div className="stack">
          <div className="panel">
            <h2>Write one now</h2>
            <p className="help">Drafts an original article for the next keyword, checks its similarity to your existing posts and puts it in the review queue.</p>
            <ActionForm action={draftNow}><Submit>Draft an article now</Submit></ActionForm>
            <ActionForm action={suggestKeywordsNow}><div style={{ marginTop: 10 }}><Submit className="btn">Suggest 10 keyword ideas</Submit></div></ActionForm>
          </div>
          <div className="panel">
            <h2>Daily schedule</h2>
            <p className="help">In xCloud, add a daily cron job that opens this address (set CRON_SECRET on the server first):</p>
            <code className="k" style={{ display: 'block', padding: 10, overflowWrap: 'anywhere' }}>curl -s &quot;{SITE.url}/api/cron/daily?key=YOUR_CRON_SECRET&quot;</code>
          </div>
          <div className="panel">
            <h2>Topic queue</h2>
            <div className="files" style={{ marginTop: 8 }}>{kws.slice(0, 20).map((k) => { const used = cfg.used.includes(k); const post = posts.find((p) => p.keyword === k); return <div key={k} className="file"><span className="fi">{used ? '✓' : '•'}</span><span className="fn"><b>{k}</b><small>{post ? `${post.status} · ${post.title}` : used ? 'Written' : 'Waiting'}</small></span>{post && <Link className="btn btn-sm" href={`/admin/posts/${post.id}/`}>Open</Link>}</div>; })}</div>
          </div>
          <div className="panel">
            <h2>Logs</h2>
            {logs.filter((l) => l.kind === 'autopub').length === 0 ? <p className="muted small">Nothing yet.</p> : <div className="files" style={{ marginTop: 8 }}>{logs.filter((l) => l.kind === 'autopub').slice(0, 15).map((l) => <div key={l.id} className="file"><span className="fi">{l.ok ? '✓' : '!'}</span><span className="fn"><b>{l.text}</b><small>{when(l.at)}</small></span></div>)}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
