import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getBlock } from '@/lib/server/settings';
import { HOME_HERO, mergeHero, type HomeHero } from '@/lib/home-hero';
import { saveHomeHero } from '../../settings-actions';

export const metadata: Metadata = { title: 'Home page text' };

export default async function HomeText() {
  await requireAdmin(FULL);
  const h = mergeHero(await getBlock<Partial<HomeHero>>('home-hero', {}));
  const d = HOME_HERO;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Website</p><h1>Home page text</h1></div><a className="btn" href="/" target="_blank" rel="noopener">View website ↗</a></div>
      <ActionForm action={saveHomeHero} className="panel form">
        <p className="help full">The first screen of the home page. Empty fields go back to the standard text. To show or hide whole home sections, use Pages &amp; builder → Home.</p>
        <F name="badge" label="Small label above the heading" value={h.badge} placeholder={d.badge} full />
        <F name="line1" label="Heading, line 1" value={h.line1} placeholder={d.line1} />
        <F name="line2" label="Heading, line 2" value={h.line2} placeholder={d.line2} />
        <F name="gold" label="Heading, gold line" value={h.gold} placeholder={d.gold} full />
        <F name="lead" label="Intro paragraph" value={h.lead} placeholder={d.lead} type="textarea" full />
        <F name="btn1" label="Main button text" value={h.btn1} placeholder={d.btn1} />
        <F name="btn1Link" label="Main button link" value={h.btn1Link} placeholder={d.btn1Link} />
        <F name="btn2" label="Second button text" value={h.btn2} placeholder={d.btn2} />
        <F name="btn2Link" label="Second button link" value={h.btn2Link} placeholder={d.btn2Link} help="/golden-visa-cost/ opens the cost calculator pop-up." />
        <F name="trust" label="Short points under the buttons (one per line, up to 5)" value={h.trust.join('\n')} type="textarea" full rows={4} />
        <div className="full"><Submit>Save home page text</Submit></div>
      </ActionForm>
    </>
  );
}
