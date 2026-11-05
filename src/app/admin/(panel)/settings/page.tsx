import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSecrets, getSite } from '@/lib/server/settings';
import { saveAi, saveFeatures, saveGeneral, saveSeo, saveSmtp, saveSocial } from '../../settings-actions';

export const metadata: Metadata = { title: 'Site settings' };
const TABS: [string, string][] = [['general', 'General & contact'], ['social', 'Social media'], ['features', 'Features'], ['seo', 'SEO & tracking'], ['email', 'Email (SMTP)'], ['ai', 'AI keys']];
const mask = (v: string) => (v ? `Saved (…${v.slice(-4)}). Leave empty to keep it.` : 'Not set');

export default async function Settings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin(FULL);
  const { tab = 'general' } = await searchParams;
  const [site, sec] = await Promise.all([getSite(), getSecrets()]);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Site settings</p><h1>Control <span className="gold">every detail.</span></h1></div></div>
      <Tabs base="/admin/settings/" tabs={TABS} cur={tab} />
      <div className="panel" style={{ maxWidth: 980 }}>
        {tab === 'general' && (
          <ActionForm action={saveGeneral} className="form">
            <F name="name" label="Website name" value={site.name} />
            <F name="tagline" label="Tagline" value={site.tagline} />
            <F name="operator" label="Company (operator)" value={site.operator} />
            <F name="licence" label="Trade licence number" value={site.licence} />
            <F name="whatsapp" label="WhatsApp number (digits with country code)" value={site.whatsapp} help="Used by every WhatsApp button on the website, e.g. 971566556645" />
            <F name="whatsappDisplay" label="WhatsApp as displayed" value={site.whatsappDisplay} />
            <F name="phone" label="Phone (for calling)" value={site.phone} />
            <F name="email" label="Email" value={site.email} type="email" />
            <F name="office" label="Office address" value={site.office} />
            <F name="hours" label="Opening hours" value={site.hours} />
            <F name="mapsUrl" label="Google Maps link" value={site.mapsUrl} full />
            <F name="footerAbout" label="Footer text" value={site.footerAbout} type="textarea" full help="Leave empty to use the standard operator and licence sentence." />
            <F name="disclaimer" label="Legal disclaimer (shown on every page)" value={site.disclaimer} type="textarea" full />
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        )}
        {tab === 'social' && (
          <ActionForm action={saveSocial} className="form">
            {(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x'] as const).map((k) => <F key={k} name={k} label={`${k === 'x' ? 'X (Twitter)' : k[0].toUpperCase() + k.slice(1)} URL`} value={site.social[k]} type="url" />)}
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        )}
        {tab === 'features' && (
          <ActionForm action={saveFeatures} className="form">
            <Toggle name="topBar" label="Top announcement bar" on={site.features.topBar} />
            <F name="topBarText" label="Announcement text" value={site.features.topBarText} />
            <Toggle name="floatingWhatsApp" label="Floating WhatsApp button" help="Shown when the quick-action dock is off" on={site.features.floatingWhatsApp} />
            <Toggle name="dock" label="Quick-action dock (desktop, right side)" on={site.features.dock} />
            <Toggle name="mobileBar" label="Mobile bottom bar" on={site.features.mobileBar} />
            <Toggle name="clientLogin" label="Client login icon" on={site.features.clientLogin} />
            <Toggle name="languageSwitcher" label="Language switcher" on={site.features.languageSwitcher} />
            <Toggle name="newsletter" label="Newsletter signup in the footer" on={site.features.newsletter} />
            <Toggle name="chatbot" label="AI chatbot on the website" help="Needs an AI key and the chatbot switched on" on={site.features.chatbot} />
            <Toggle name="offer" label="Offer pop-up" help="Edit it under Offer pop-up" on={site.features.offer} />
            <Toggle name="preloader" label="Animated preloader on first visit" on={site.features.preloader} />
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        )}
        {tab === 'seo' && (
          <ActionForm action={saveSeo} className="form">
            <F name="homeTitle" label="Home page title (optional)" value={sec.seo.homeTitle} full />
            <F name="homeMeta" label="Home page description (optional)" value={sec.seo.homeMeta} type="textarea" full />
            <F name="googleVerify" label="Google Search Console verification code" value={sec.seo.googleVerify} />
            <F name="bingVerify" label="Bing Webmaster verification code" value={sec.seo.bingVerify} />
            <F name="headCode" label="Code in <head> (Google Analytics, Meta Pixel…)" value={sec.seo.headCode} type="textarea" rows={6} full />
            <F name="bodyCode" label="Code at end of <body>" value={sec.seo.bodyCode} type="textarea" rows={4} full />
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        )}
        {tab === 'email' && (
          <ActionForm action={saveSmtp} className="form">
            <F name="host" label="SMTP host (e.g. mail.yourdomain.com)" value={sec.smtp.host} />
            <F name="port" label="Port (465 or 587)" value={sec.smtp.port} type="number" />
            <F name="user" label="Username (full email address)" value={sec.smtp.user} />
            <F name="pass" label="Password" type="password" help={mask(sec.smtp.pass)} />
            <F name="from" label="From (e.g. Abu Dhabi Golden Visa <info@…>)" value={sec.smtp.from} />
            <F name="notify" label="Send website notifications to" value={sec.smtp.notify} help="New enquiries, applications and client accounts" />
            <Toggle name="secure" label="Use SSL (turn on for port 465)" on={sec.smtp.secure} />
            <div className="full row"><Submit className="btn">Save</Submit><Submit name="test" value="1">Save and send a test email</Submit></div>
          </ActionForm>
        )}
        {tab === 'ai' && (
          <ActionForm action={saveAi} className="form">
            <div className="field full"><label htmlFor="provider">Main AI provider</label>
              <select id="provider" name="provider" defaultValue={sec.ai.provider}><option value="">Off</option><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option><option value="anthropic">Anthropic Claude</option></select>
              <p className="help">Used by the chatbot, automatic translation and the Auto Publisher.</p></div>
            <F name="openaiKey" label="OpenAI API key" type="password" help={mask(sec.ai.openaiKey)} />
            <F name="geminiKey" label="Google Gemini API key" type="password" help={mask(sec.ai.geminiKey)} />
            <F name="anthropicKey" label="Anthropic API key" type="password" help={mask(sec.ai.anthropicKey)} />
            <F name="model" label="Model (optional)" value={sec.ai.model} placeholder="Leave empty for a sensible default" />
            <F name="dailyBudget" label="Daily limit of automatic AI requests (translation, Auto Publisher)" value={sec.ai.dailyBudget} type="number" />
            <div className="full row small">
              <label className="row"><input type="checkbox" name="clear_openaiKey" /> Remove OpenAI key</label>
              <label className="row"><input type="checkbox" name="clear_geminiKey" /> Remove Gemini key</label>
              <label className="row"><input type="checkbox" name="clear_anthropicKey" /> Remove Anthropic key</label>
            </div>
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
        )}
      </div>
    </>
  );
}
