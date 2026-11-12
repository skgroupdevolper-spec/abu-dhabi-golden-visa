import { PwInput } from '@/components/dash/PwInput';
// AI keys and provider/model per feature, shown on the Chatbot, Languages and Auto Publisher pages.
import { ActionForm, Submit } from './ActionForm';
import { getSecrets } from '@/lib/server/settings';
import { saveAiRoute } from '@/app/admin/settings-actions';
import { testAi } from '@/app/admin/ai-actions';
import type { AiUse } from '@/lib/settings-schema';

const mask = (k: string) => (k ? `Saved: ••••${k.slice(-4)}` : 'Not set');
const LABEL: Record<AiUse, string> = { chat: 'Chatbot AI', translate: 'Translation AI', writer: 'Writer AI (research, outline, article)', editor: 'Editor AI (second pass; a different provider gives a fresher edit)' };
const MODELS = 'e.g. gpt-4.1-mini · gemini-3.8-flash · claude-haiku-4-5 (empty = recommended)';

export async function AiPanel({ uses, images = false, title = 'AI provider & API keys' }: { uses: AiUse[]; images?: boolean; title?: string }) {
  const a = (await getSecrets()).ai;
  return (
    <div className="panel">
      <h2>{title}</h2>
      <p className="help" style={{ margin: '4px 0 12px' }}>Keys are stored on your server, shown masked and never written to logs. Save first, then press Test.</p>
      <ActionForm action={saveAiRoute} className="form">
        {uses.map((u) => {
          const r = a.routes?.[u];
          return (
            <div key={u} className="full form" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field"><label htmlFor={`p_${u}`}>{LABEL[u]}</label>
                <select id={`p_${u}`} name={`p_${u}`} defaultValue={r?.provider ?? ''}><option value="">Same as main ({a.provider || 'off'})</option><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option><option value="anthropic">Anthropic Claude</option></select></div>
              <div className="field"><label htmlFor={`m_${u}`}>Model</label><input id={`m_${u}`} name={`m_${u}`} defaultValue={r?.model ?? ''} placeholder={MODELS} /></div>
            </div>
          );
        })}
        {images && (
          <div className="full form" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field"><label htmlFor="p_images">Picture provider (AI covers)</label>
              <select id="p_images" name="p_images" defaultValue={a.images?.provider ?? 'none'}><option value="none">None (designed covers and photo library)</option><option value="openai">OpenAI images</option><option value="gemini">Google Gemini images</option></select></div>
            <div className="field"><label htmlFor="m_images">Picture model</label><input id="m_images" name="m_images" defaultValue={a.images?.model ?? ''} placeholder="gpt-image-1 · gemini-3.1-flash-image" /></div>
          </div>
        )}
        <div className="field"><label htmlFor="provider">Main provider (used when a feature says “same as main”)</label>
          <select id="provider" name="provider" defaultValue={a.provider}><option value="">Off</option><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option><option value="anthropic">Anthropic Claude</option></select></div>
        <div className="field"><label htmlFor="dailyBudget">Daily limit of automatic AI requests</label><input id="dailyBudget" name="dailyBudget" type="number" defaultValue={a.dailyBudget} /></div>
        <div className="field"><label htmlFor="openaiKey">OpenAI API key</label><PwInput id="openaiKey" name="openaiKey"  autoComplete="off" placeholder={mask(a.openaiKey)} /></div>
        <div className="field"><label htmlFor="geminiKey">Google Gemini API key</label><PwInput id="geminiKey" name="geminiKey"  autoComplete="off" placeholder={mask(a.geminiKey)} /></div>
        <div className="field"><label htmlFor="anthropicKey">Anthropic Claude API key</label><PwInput id="anthropicKey" name="anthropicKey"  autoComplete="off" placeholder={mask(a.anthropicKey)} /></div>
        <div className="field small"><span className="lbl">Remove a key</span><label className="row"><input type="checkbox" name="clear_openaiKey" /> OpenAI</label><label className="row"><input type="checkbox" name="clear_geminiKey" /> Gemini</label><label className="row"><input type="checkbox" name="clear_anthropicKey" /> Claude</label></div>
        <p className="help full">Get keys at platform.openai.com, aistudio.google.com and console.anthropic.com.</p>
        <div className="full"><Submit>Save AI settings</Submit></div>
      </ActionForm>
      <ActionForm action={testAi}><input type="hidden" name="use" value={uses[0]} /><div style={{ marginTop: 10 }}><Submit className="btn">Test the {LABEL[uses[0]].split(' (')[0]}</Submit></div></ActionForm>
    </div>
  );
}
