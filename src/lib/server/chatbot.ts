import 'server-only';
import { FAQS } from '@/content/faqs';
import { SERVICE_CATALOG } from '@/content/services-catalog';
import { LOCALES } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import { getFaqs, getServiceOverrides } from './content';
import { getBlock } from './settings';
import { getFees } from './store';

export type ChatbotCfg = { name: string; greeting: Record<string, string>; knowledge: string; handover: string; position: 'left' | 'right'; askContact: boolean; triggers?: { human: boolean; unknown: boolean; quote: boolean; apply: boolean };
  maxPerDay?: number; maxPerChat?: number; keepDays?: number; rules?: string; waNumber?: string };
export const CB0: ChatbotCfg = {
  name: 'Golden Visa assistant',
  greeting: { en: 'Hello! I can help with Golden Visa routes, documents and costs. What would you like to know?', ar: 'مرحبًا! يمكنني مساعدتك في فئات الإقامة الذهبية والمستندات والتكاليف. بماذا أساعدك؟', ru: 'Здравствуйте! Помогу с категориями Golden Visa, документами и стоимостью. Что вас интересует?', hi: 'नमस्ते! मैं गोल्डन वीज़ा की श्रेणियों, दस्तावेज़ों और लागत में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?', ur: 'السلام علیکم! میں گولڈن ویزا کے زمروں، دستاویزات اور اخراجات میں مدد کر سکتا ہوں۔ آپ کیا جاننا چاہیں گے؟', zh: '您好！我可以帮您了解黄金签证类别、文件和费用。请问您想了解什么？' },
  knowledge: '', handover: 'For your personal case, an advisor can help on WhatsApp.', position: 'left', askContact: true,
};

function handoverWhen(cfg: ChatbotCfg) {
  const t = cfg.triggers ?? { human: true, unknown: true, quote: true, apply: true };
  const w = [t.human && 'the visitor asks for a person', t.unknown && 'you cannot answer from the information below', t.quote && 'the visitor wants a personal quote', t.apply && 'the visitor wants to apply'].filter(Boolean);
  return w.length ? w.join(', or ') : 'the visitor needs personal advice';
}

export async function chatSystemPrompt(lang: string) {
  const cfg = await getBlock<ChatbotCfg>('chatbot', CB0);
  const [fees, faqs, svc] = await Promise.all([getFees(), getFaqs(), getServiceOverrides()]);
  const services = SERVICE_CATALOG.map((g) => `${g.title}: ${g.items.filter((i) => !svc.hidden.includes(i.href)).map((i) => `${i.label} (${i.href}${svc.prices[i.href] ? `, ${svc.prices[i.href]}` : ''})`).join('; ')}`).join('\n');
  const qa = (faqs.length ? faqs : FAQS).map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n');
  const language = LOCALES.find((l) => l.code === lang)?.name ?? 'the visitor’s language';
  return `You are "${cfg.name}", the website assistant of ${SITE.name}, a private consultancy operated by ${SITE.operator} (Trade Licence ${SITE.licence}).
Answer in ${language} unless the visitor writes in another language, then use theirs. Be brief (under 120 words), warm and precise.
Only use the information below. If unsure, say so and offer WhatsApp. Never promise approval, never give fixed processing times, never invent fees. Say government fees are paid in AED and can change.
This is not an official government website; visa decisions are made by the UAE authorities.
Suggest site paths when useful (write them as /path/): eligibility check /visa-check/, cost calculator /golden-visa-cost/, contact /contact/.
When ${handoverWhen(cfg)}, reply with the handover: "${cfg.handover}" and mention WhatsApp ${cfg.waNumber || SITE.whatsappDisplay}.${cfg.askContact ? ' Before going deep, ask once for the visitor’s name and WhatsApp number so an advisor can follow up.' : ''}

GOVERNMENT FEES (AED, schedule ${fees.date}): visa ${fees.perPerson.visa.aed}; Emirates ID 10 years ${fees.perPerson.emiratesId.aed}; change of status inside UAE ${fees.perPerson.changeOfStatus.aed}; medical normal ${fees.medical.normal.aed} / VIP ${fees.medical.vip.aed} (adults only); sponsor file ${fees.sponsorFile.aed} once; property value certificate ${fees.propertyValuation.aed}. Example: property investor inside the UAE about AED 4,728.15 for the main applicant.
MAIN ROUTES: property AED 2M+ in Abu Dhabi (off-plan if AED 2M paid; mortgaged if own equity AED 2M); investors AED 2M deposit/capital or AED 250,000 tax a year for 2 years; entrepreneurs; skilled professionals degree + work permit + AED 30,000 monthly salary; outstanding students; talents and scientists by recommendation; family: spouse, children of any age, parents with insurance.
SERVICES:\n${services}
FAQS:\n${qa}
CONTACT: WhatsApp ${SITE.whatsappDisplay}, email ${SITE.email}, office ${SITE.office}${SITE.hours ? `, hours ${SITE.hours}` : ''}.
${cfg.knowledge ? `EXTRA COMPANY KNOWLEDGE:\n${cfg.knowledge}` : ''}
${cfg.rules ? `EXTRA RULES:\n${cfg.rules}` : ''}`;
}
