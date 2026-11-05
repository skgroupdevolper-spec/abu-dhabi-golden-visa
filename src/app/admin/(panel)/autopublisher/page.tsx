import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { AiPanel } from '@/components/dash/AiPanel';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { aiReady } from '@/lib/server/ai';
import { AP0, similarity, type AutoPub, type Job, type Mission } from '@/lib/server/autopub';
import { list } from '@/lib/server/collections';
import { getCategories, type Post } from '@/lib/server/content';
import { getBlock } from '@/lib/server/settings';
import type { AiLog } from '@/lib/server/translate';
import { SITE } from '@/lib/site';
import { when } from '@/lib/stages';
import { addKeywords, draftNow, keywordAction, missionAction, reviewPost, saveAutopub, saveMission, suggestKeywordsNow, togglePause } from '../../ai-actions';

export const metadata: Metadata = { title: 'Auto Publisher' };
const TABS: [string, string][] = [['overview', 'Overview'], ['missions', 'Missions'], ['review', 'Review queue'], ['keywords', 'Keywords'], ['knowledge', 'Knowledge & references'], ['ai', 'AI & pictures'], ['quality', 'Quality & SEO'], ['similarity', 'Similarity report'], ['schedule', 'Schedule'], ['logs', 'Logs']];
const today = () => new Date().toISOString().slice(0, 10);

export default async function AutoPublisher({ searchParams }: { searchParams: Promise<{ tab?: string; edit?: string }> }) {
  await requireAdmin(FULL);
  const { tab = 'overview', edit } = await searchParams;
  const [cfg, ready, posts, logs, cats, missions, jobs] = await Promise.all([getBlock<AutoPub>('autopub', AP0), aiReady('writer'), list<Post>('posts'), list<AiLog>('ai-log'), getCategories(), list<Mission>('ap-missions'), list<Job>('ap-jobs')]);
  const kws = cfg.keywords.split('\n').map((k) => k.trim()).filter(Boolean);
  const queue = posts.filter((p) => p.source === 'auto' && (p.status === 'review' || p.status === 'draft'));
  const left = kws.filter((k) => !cfg.used.includes(k)).length;
  const week = jobs.filter((j) => j.status !== 'failed' && Date.now() - new Date(j.at).getTime() < 7 * 864e5).length;
  const callsToday = logs.filter((l) => l.kind === 'autopub' && l.at.slice(0, 10) === today()).length;
  const state = !ready ? ['due', 'No AI key'] : !cfg.on ? ['due', 'Off'] : cfg.paused ? ['due', 'Paused'] : ['ok', 'Running'];
  const m = edit === 'new' ? null : missions.find((x) => x.id === edit);
  const catOpts = <>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</>;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Auto Publisher</p><h1>Auto Publisher</h1><p className="muted small" style={{ marginTop: 6 }}>Missions write original, SEO-ready articles with cover, category, tags and FAQs, check quality, then publish or wait for your review. Every published article is translated automatically.</p></div>
        <div className="row"><span className={`pill ${state[0]}`}>{state[1]}</span>
          <form action={togglePause}><input type="hidden" name="what" value="on" /><button className={`btn ${cfg.on ? '' : 'btn-gold'}`}>{cfg.on ? 'Switch off' : 'Switch on'}</button></form>
          {cfg.on && <form action={togglePause}><input type="hidden" name="what" value="pause" /><button className="btn">{cfg.paused ? 'Resume' : 'Pause'}</button></form>}</div></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Waiting for review</small><b>{queue.length}</b><Link className="small" href="/admin/autopublisher/?tab=review">Open queue →</Link></div>
        <div className="kpi"><small>Articles this week</small><b>{week}</b></div>
        <div className="kpi"><small>Active missions</small><b>{missions.filter((x) => x.active).length}</b></div>
        <div className="kpi goldbg"><small>Last run</small><b style={{ fontSize: 20 }}>{cfg.lastRun ? when(cfg.lastRun) : 'Never'}</b></div>
      </div>
      <Tabs base="/admin/autopublisher/" tabs={TABS} cur={tab} />

      {tab === 'overview' && (
        <div className="cols">
          <div className="panel">
            <h2>Live jobs</h2>
            {!jobs.length ? <p className="muted small">No articles written yet. Create a mission or add keywords, then press “Run now”.</p> : (
              <div className="files" style={{ marginTop: 8 }}>{jobs.slice(0, 15).map((j) => (
                <div key={j.id} className="file"><span className="fi">{j.status === 'done' ? '✓' : j.status === 'writing' ? '…' : '!'}</span>
                  <span className="fn"><b>{j.title || j.topic}</b><small>{when(j.at)} · {j.mission ?? 'Keyword queue'} · {j.status}{j.note ? ` · ${j.note}` : ''}</small></span>
                  {j.postId && <Link className="btn btn-sm" href={`/admin/posts/${j.postId}/`}>Open</Link>}</div>))}</div>)}
          </div>
          <div className="stack">
            <div className="panel">
              <h2>Run now</h2>
              <p className="help">Writes one article now: the next topic of the first active mission, or the next keyword in the queue.</p>
              {!ready && <p className="notice err">Add the Writer AI key in the <Link href="/admin/autopublisher/?tab=ai">AI &amp; pictures</Link> tab.</p>}
              <ActionForm action={draftNow}><Submit>Run now · write one article</Submit></ActionForm>
            </div>
            <div className="panel">
              <h2>Status</h2>
              <div className="files">
                {[['Master switch', cfg.on ? 'On' : 'Off'], ['Paused', cfg.paused ? 'Yes' : 'No'], ['Writer AI', ready ? 'Connected' : 'Not set'], ['AI calls today', String(callsToday)], ['Keywords left', String(left)], ['After writing', cfg.review ? 'Review first' : 'Publish when quality passes'], ['Covers', cfg.coverStyle === 'ai' ? 'AI pictures' : cfg.coverStyle === 'photos' ? 'Photo library' : 'Designed covers']].map(([a, b]) => (
                  <div key={a} className="file"><span className="fn"><b>{a}</b></span><span className="small">{b}</span></div>))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'missions' && (
        <div className="cols">
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}><h2>Missions</h2><Link className="btn btn-gold btn-sm" href="/admin/autopublisher/?tab=missions&edit=new">+ New mission</Link></div>
            <p className="help">A mission is a topic area with its own schedule: for example “Property investors from India, 2 per week, publish”.</p>
            {!missions.length ? <p className="empty" style={{ marginTop: 12 }}>No missions yet.</p> : (
              <div className="files" style={{ marginTop: 10 }}>{missions.map((x) => (
                <div key={x.id} className="file" style={{ flexWrap: 'wrap' }}>
                  <span className="fi">{x.active ? '●' : '○'}</span>
                  <span className="fn"><b>{x.name}</b><small>{x.perWeek}/week · {x.after === 'publish' ? 'publish' : 'draft'} · {x.done} written · {x.lastRun ? `last ${when(x.lastRun)}` : 'not run yet'}{x.end !== 'never' ? ` · ends ${x.end === 'date' ? x.endDate : x.end === 'count' ? `after ${x.endCount}` : 'after its titles'}` : ''}</small></span>
                  <div className="row">
                    <Link className="btn btn-sm" href={`/admin/autopublisher/?tab=missions&edit=${x.id}`}>Edit</Link>
                    {(['run', 'toggle', 'reset', 'delete'] as const).map((op) => (
                      <form key={op} action={missionAction}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value={op} /><button className={`btn btn-sm${op === 'delete' ? ' btn-ghost' : ''}`}>{op === 'run' ? 'Write one' : op === 'toggle' ? (x.active ? 'Pause' : 'Activate') : op === 'reset' ? 'Reset' : 'Delete'}</button></form>))}
                  </div>
                </div>))}</div>)}
          </div>
          <div className="panel">
            {edit === undefined ? <p className="muted">Choose a mission to edit, or create a new one.</p> : (
              <ActionForm action={saveMission} className="form" key={edit}>
                <h2 className="full">{m ? `Edit: ${m.name}` : 'New mission'}</h2>
                {m && <input type="hidden" name="id" value={m.id} />}
                <F name="name" label="Mission name" value={m?.name} placeholder="Property investors 2026" full />
                <div className="full"><Toggle name="active" label="Active" on={m ? m.active : true} /></div>
                <F name="focus" label="Focus (what this mission writes about)" value={m?.focus} type="textarea" rows={3} full placeholder="Golden Visa through property in Abu Dhabi: rules, off-plan, mortgages, documents" />
                <F name="countries" label="Readers from (countries)" value={m?.countries} placeholder="India, Pakistan, UK" full />
                <F name="seeds" label="Seed keywords (one per line; when empty the AI suggests new ones from the focus)" value={m?.seeds} type="textarea" rows={5} full />
                <F name="titles" label="Exact titles (one per line, optional: Title | 2026-12-01 | category | image link)" value={m?.titles} type="textarea" rows={4} full help="Titles are written first, in order. A date schedules publishing." />
                <F name="perWeek" label="Articles per week" value={m?.perWeek ?? 2} type="number" />
                <div className="field"><label htmlFor="after">After writing</label><select id="after" name="after" defaultValue={m?.after ?? 'draft'}><option value="draft">Wait for my review</option><option value="publish">Publish when quality passes</option></select></div>
                <F name="minWords" label="Minimum words" value={m?.minWords ?? 800} type="number" />
                <F name="maxWords" label="Maximum words" value={m?.maxWords ?? 1500} type="number" />
                <div className="field"><label htmlFor="mcat">Category</label><select id="mcat" name="category" defaultValue={m?.category ?? ''}><option value="">Let the AI choose</option>{catOpts}</select></div>
                <div className="field"><label htmlFor="end">Mission ends</label><select id="end" name="end" defaultValue={m?.end ?? 'never'}><option value="never">Never</option><option value="date">On a date</option><option value="count">After a number of articles</option><option value="titles">When its titles are written</option></select></div>
                <F name="endDate" label="End date" value={m?.endDate} type="date" />
                <F name="endCount" label="End after (articles)" value={m?.endCount} type="number" />
                <div className="full row"><Submit>{m ? 'Save mission' : 'Create mission'}</Submit><Link className="btn" href="/admin/autopublisher/?tab=missions">Cancel</Link></div>
              </ActionForm>)}
          </div>
        </div>
      )}

      {tab === 'review' && (
        <div className="panel">
          <h2>Review queue</h2>
          <p className="help">Articles waiting for you, and drafts held by the quality checks. Open one to edit, or publish it straight away.</p>
          {!queue.length ? <p className="empty" style={{ marginTop: 12 }}>Nothing to review.</p> : (
            <div className="files" style={{ marginTop: 10 }}>{queue.map((p) => (
              <div key={p.id} className="file" style={{ flexWrap: 'wrap' }}>
                {p.cover ? <img src={p.cover} alt="" style={{ width: 72, height: 38, objectFit: 'cover', borderRadius: 6 }} /> : <span className="fi">✎</span>}
                <span className="fn"><b>{p.title}</b><small>{when(p.createdAt)} · {p.status} · similarity {Math.round((p.similarity ?? 0) * 100)}% · {p.body.split(/\s+/).length} words · {p.keyword}</small></span>
                <div className="row"><Link className="btn btn-sm" href={`/admin/posts/${p.id}/`}>Edit</Link>
                  <form action={reviewPost}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="op" value="publish" /><button className="btn btn-sm btn-gold">Publish</button></form>
                  {p.status === 'review' && <form action={reviewPost}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="op" value="reject" /><button className="btn btn-sm btn-ghost">Reject</button></form>}</div>
              </div>))}</div>)}
        </div>
      )}

      {tab === 'keywords' && (
        <div className="cols">
          <div className="panel">
            <h2>Keyword queue ({left} waiting)</h2>
            <p className="help">Used when no mission is active. Each keyword becomes one article.</p>
            <div className="files" style={{ marginTop: 8 }}>{kws.map((k) => {
              const used = cfg.used.includes(k); const post = posts.find((p) => p.keyword === k);
              return (
                <div key={k} className="file" style={{ flexWrap: 'wrap' }}><span className="fi">{used ? '✓' : '•'}</span><span className="fn"><b>{k}</b><small>{post ? `${post.status} · ${post.title}` : used ? 'Written' : 'Waiting'}</small></span>
                  <div className="row">{post && <Link className="btn btn-sm" href={`/admin/posts/${post.id}/`}>Open</Link>}
                    {(used ? ['reuse', 'delete'] : ['write', 'delete']).map((op) => <form key={op} action={keywordAction}><input type="hidden" name="k" value={k} /><input type="hidden" name="op" value={op} /><button className={`btn btn-sm${op === 'delete' ? ' btn-ghost' : ''}`}>{op === 'write' ? 'Write now' : op === 'reuse' ? 'Use again' : 'Remove'}</button></form>)}</div></div>);
            })}</div>
          </div>
          <div className="stack">
            <div className="panel"><h2>Add keywords</h2>
              <ActionForm action={addKeywords} className="form" reset><F name="add" label="One per line" type="textarea" rows={5} full /><div className="full"><Submit>Add to queue</Submit></div></ActionForm></div>
            <div className="panel"><h2>Suggest keywords with AI</h2>
              <ActionForm action={suggestKeywordsNow} className="form"><F name="focus" label="Focus (optional)" placeholder="Golden Visa for nurses" full /><F name="countries" label="Readers from (optional)" placeholder="Philippines, India" full /><div className="full"><Submit>Suggest 10 ideas</Submit></div></ActionForm></div>
          </div>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="panel" style={{ maxWidth: 900 }}>
          <ActionForm action={saveAutopub} className="form">
            <F name="tone" label="Tone of voice" value={cfg.tone} full />
            <F name="audience" label="Audience" value={cfg.audience} placeholder="Investors, professionals and families moving to Abu Dhabi" full />
            <F name="knowledge" label="Company knowledge (services, prices, process, what makes you different)" value={cfg.knowledge} type="textarea" rows={8} full />
            <F name="references" label="Trusted references (official links and notes; the writer bases facts on these but never copies wording)" value={cfg.references} type="textarea" rows={6} full placeholder={'https://icp.gov.ae/en/\nhttps://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa'} />
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        </div>
      )}

      {tab === 'ai' && (
        <div className="cols">
          <AiPanel uses={['writer', 'editor']} images title="Auto Publisher AI & API keys" />
          <div className="panel">
            <h2>Covers & editing</h2>
            <ActionForm action={saveAutopub} className="form">
              <input type="hidden" name="_toggles" value="editorPass" />
              <div className="field full"><label htmlFor="coverStyle">Cover picture</label><select id="coverStyle" name="coverStyle" defaultValue={cfg.coverStyle ?? (cfg.aiCovers ? 'ai' : 'designed')}><option value="designed">Designed cover (title on Abu Dhabi photo, free)</option><option value="photos">My photo library (links below, used in turn)</option><option value="ai">AI picture (picture provider at left)</option></select></div>
              <F name="photoStyle" label="AI picture style (optional)" value={cfg.photoStyle} placeholder="aerial view, sunset, minimal" full />
              <F name="covers" label="Photo library links (one per line; copy from Media library)" value={cfg.covers} type="textarea" rows={4} full />
              <div className="full"><Toggle name="editorPass" label="Second pass by the Editor AI" help="Improves clarity and removes risky claims. Uses one extra AI call per article." on={!!cfg.editorPass} /></div>
              <div className="full"><Submit>Save</Submit></div>
            </ActionForm>
          </div>
        </div>
      )}

      {tab === 'quality' && (
        <div className="panel" style={{ maxWidth: 900 }}>
          <ActionForm action={saveAutopub} className="form">
            <input type="hidden" name="_toggles" value="review,requireFaq" />
            <div className="full"><Toggle name="review" label="Keyword queue: review before publishing" help="Missions have their own setting." on={cfg.review} /></div>
            <F name="perWeek" label="Keyword queue: articles per week" value={cfg.perWeek} type="number" />
            <div className="field"><label htmlFor="category">Default category</label><select id="category" name="category" defaultValue={cfg.category ?? ''}><option value="">Let the AI choose</option>{catOpts}</select></div>
            <F name="minWords" label="Minimum words" value={cfg.minWords ?? 600} type="number" />
            <F name="maxWords" label="Maximum words" value={cfg.maxWords ?? 1400} type="number" />
            <F name="maxSimilarity" label="Maximum similarity to your posts (%)" value={cfg.maxSimilarity ?? 35} type="number" />
            <F name="faqCount" label="FAQs per article" value={cfg.faqCount ?? 4} type="number" />
            <F name="internalLinks" label="Internal links per article" value={cfg.internalLinks ?? 4} type="number" />
            <F name="banned" label="Blocked phrases (one per line)" value={cfg.banned ?? 'guaranteed approval\n100% approval\nguarantee'} type="textarea" rows={4} full />
            <div className="full"><Toggle name="requireFaq" label="Every article must have FAQs" on={cfg.requireFaq ?? true} /></div>
            <label className="row small full"><input type="checkbox" name="resetUsed" /> Allow used keywords again</label>
            <p className="help full">Articles that fail a check are kept as drafts with the reason, so nothing weak goes live.</p>
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        </div>
      )}

      {tab === 'similarity' && (() => {
        const pub = posts.filter((p) => p.body).slice(0, 120);
        const rows = pub.map((p) => { let best = 0, twin: Post | undefined; for (const q of pub) if (q.id !== p.id) { const s = similarity(p.body, q.body); if (s > best) { best = s; twin = q; } } return { p, best, twin }; }).sort((a, b) => b.best - a.best);
        const lim = (cfg.maxSimilarity ?? 35) / 100;
        return (
          <div className="panel">
            <h2>Similarity report</h2>
            <p className="help">How close each post is to your most similar other post. Above {Math.round(lim * 100)}% may look duplicated to Google: rewrite or merge it.</p>
            <div className="files" style={{ marginTop: 10 }}>{rows.slice(0, 60).map(({ p, best, twin }) => (
              <div key={p.id} className="file"><span className={`pill ${best > lim ? 'due' : 'ok'}`}>{Math.round(best * 100)}%</span><span className="fn"><b>{p.title}</b><small>{twin ? `closest: ${twin.title}` : '—'}</small></span><Link className="btn btn-sm" href={`/admin/posts/${p.id}/`}>Open</Link></div>))}
              {!rows.length && <p className="muted small">No posts yet.</p>}</div>
          </div>);
      })()}

      {tab === 'schedule' && (
        <div className="panel" style={{ maxWidth: 900 }}>
          <h2>Daily schedule</h2>
          <p className="help">The publisher runs once a day. In xCloud, add a daily cron job that opens this address (set CRON_SECRET on the server first). Each run writes for every mission that is behind its weekly number, then resumes automatic translation.</p>
          <code className="k" style={{ display: 'block', padding: 10, overflowWrap: 'anywhere', marginTop: 10 }}>curl -s &quot;{SITE.url}/api/cron/daily?key=YOUR_CRON_SECRET&quot;</code>
          <p className="help" style={{ marginTop: 10 }}>Tip: run it two or three times a day (for example 06:00, 13:00, 20:00) to spread articles out; missions never write more than their weekly number.</p>
        </div>
      )}

      {tab === 'logs' && (
        <div className="panel">
          <h2>Logs</h2>
          {logs.filter((l) => l.kind === 'autopub').length === 0 ? <p className="muted small">Nothing yet.</p> : <div className="files" style={{ marginTop: 8 }}>{logs.filter((l) => l.kind === 'autopub').slice(0, 100).map((l) => <div key={l.id} className="file"><span className="fi">{l.ok ? '✓' : '!'}</span><span className="fn"><b>{l.text}</b><small>{when(l.at)}</small></span></div>)}</div>}
        </div>
      )}
    </>
  );
}
