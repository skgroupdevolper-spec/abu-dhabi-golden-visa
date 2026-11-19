// Body of the UAE visa status check page (/visa-check/): official portals, how our free check works,
// the complete guide (grace periods, fines, GDRFA or ICP, portal steps), questions and next steps.
import type { Locale } from '@/lib/i18n';
import { u } from '@/lib/ui';
import { SITE, waLink } from '@/lib/site';
import { Icon } from './Icon';
import { L } from './L';
import { AskCheckButton } from './VisaStatus';
import { PORTALS } from '@/lib/visa-portals';

const GUIDE: { id: string; t: string; p: string[]; extra?: 'grace' | 'auth' | 'portal' | 'ours'; note?: string }[] = [
  { id: 'what', t: 'What a visa status check really tells you', p: [
    'A status check is more than a date on a screen. It confirms the “file validity” of your record in the UAE: your entry permit or residence status, any grace period, and any block or absconding report against your name.',
    'For a resident, it shows whether the immigration file is active, free of fines and matched to the passport you are carrying now.',
  ], note: 'One free check gives you the validity, the grace period and any overstay fines, with no UAE PASS login.' },
  { id: 'passport', t: 'Checking by passport number: the easiest route', p: [
    'Older methods asked for a unified number, a file number or a UAE PASS login. Today the most common way is the passport search, because everyone has their passport to hand.',
    'Give the passport number and expiry date with your date of birth and nationality, and the public lookup on the immigration portal finds the record. There is no need to dig out an old visa copy: the passport itself is enough.',
  ] },
  { id: 'grace', t: 'Grace periods and the last day you can stay', p: [
    'The UAE allows different grace periods depending on the visa and whether it was cancelled or simply ran out, and the rules change from time to time. A validity check gives you the exact date your legal stay ends.',
    'Visitors need this most. Many people assume a visa lasts exactly 30 or 60 days and count from the wrong date. When we check for you, we tell you the last day you can stay without a fine.',
  ], extra: 'grace' },
  { id: 'fines', t: 'Overstay fines: protect your money', p: [
    'The UAE charges a fixed fine for each day you stay past your permitted date, on tourist and residence visas alike. If you think your visa may already have run out, check straight away.',
    'Fines do not go away if you ignore them. Unpaid amounts can lead to a block at immigration, which can stop you leaving through the airport and cause problems entering other GCC countries later. When you ask us, we confirm the exact amount owed so you can pay it and then leave or renew without trouble.',
  ] },
  { id: 'only-passport', t: 'Can you check a visa with only a passport number?', p: [
    'The passport number is the main key, but privacy rules call for a second detail to prove the record is yours.',
    'That is why the portals, and our check, pair the number with your nationality and date of birth. It is as close to a passport-only check as the rules allow, and it stops strangers reading your immigration data.',
  ], note: 'Dubai files are held by GDRFA. Files from every other emirate are held by ICP.' },
  { id: 'authority', t: 'GDRFA or ICP: which one holds your visa?', p: ['A lot of failed searches come down to using the wrong authority. Each one keeps its own records:'], extra: 'auth' },
  { id: 'portal-steps', t: 'Step by step on the official portals', p: [
    'To do it on your own, use the portal that matches the emirate on your visa. Dubai visas are searched on the GDRFA Dubai status enquiry, by file number or passport details. Visas from anywhere else are searched on ICP:',
  ], extra: 'portal' },
  { id: 'easy', t: 'The easy option: ask us to check, free', p: [
    'The portals can be confusing, with captchas, drop-down lists and different search modes. If you would rather skip them, use the checker at the top of this page and a member of our team runs the same search for you at no charge.',
  ], extra: 'ours' },
];

export const VISA_STATUS_FAQ = [
  { q: 'Can I check my UAE visa status with my passport number?', a: 'Yes. Both official portals search by passport number together with your nationality and date of birth. Send us the same details and we check it for you, free.' },
  { q: 'Is checking a Dubai visa different from checking a UAE visa?', a: 'Only in where you look. Dubai visas are held by GDRFA Dubai; visas from the other six emirates are held by ICP. Our checker tells you which one to use.' },
  { q: 'How do I find out about overstay fines?', a: 'The status result shows whether the file has expired. We confirm the exact fine owed, which is AED 50 for each day after the visa and any grace period end.' },
  { q: 'What does “file validity” mean, and why does it matter?', a: 'It is the official state of your immigration record: valid, cancelled or expired, with its dates. It decides whether you can stay, renew, change visa or leave without a fine.' },
  { q: 'How many days of grace do I get once my visa ends?', a: 'It depends on the visa: usually 30 days for most residence visas, up to 90 days for property owners, up to 180 days for Golden and Green visas, and usually none for visit and tourist visas.' },
  { q: 'What does a “cancelled” status mean?', a: 'The visa was cancelled, for example by the employer or sponsor. Your grace period starts on the cancellation date, so check how many days you have left.' },
  { q: 'What happens if I do not pay overstay fines?', a: 'Unpaid fines can lead to a block at immigration, which may stop you leaving the UAE or getting a new visa. We confirm the amount so you can settle it first.' },
  { q: 'Is my data safe if I use the WhatsApp check?', a: 'Nothing is saved on this website. Your details go into a WhatsApp message that you send us yourself, and our team uses them only to check your file.' },
];

export function VisaStatusPage({ locale }: { locale: Locale }) {
  const t = (s: string) => u(s, locale);
  const wa = waLink('Hello, please check my UAE visa status.');
  return (
    <>
      {/* 01 · Official portals */}
      <section className="block vsp" id="portals" data-reveal>
        <p className="eyebrow vsp-k">01 · {t('Official portals')}</p>
        <h2>{t('Check it yourself, free, on the government sites')}</h2>
        <p className="lead-s">{t('The lookup costs nothing. Which site you use depends only on the emirate that issued the visa: Dubai visas sit with GDRFA Dubai, and visas from the other six emirates sit with ICP.')}</p>
        <div className="vsp-2">
          {([['gdrfa', 'Visa issued in Dubai', ['Go to the GDRFA Dubai status enquiry page.', 'Search with your file number, or with your passport number, nationality and date of birth.', 'Fill in the captcha to see the status with its issue and expiry dates.']],
            ['icp', 'Abu Dhabi, Ajman, Fujairah, Ras Al Khaimah, Sharjah, Umm Al Quwain', ['In ICP Smart Services, open File Validity.', 'Select Residency or Visa, then Passport Information and enter the passport number, nationality and date of birth.', 'Fill in the captcha to see the file status, the expiry date and how many days you can still stay.']]] as const).map(([k, where, steps]) => (
            <article key={k} className="vsp-portal card">
              <p className="vsp-where">{t(where)}</p>
              <h3>{t(k === 'gdrfa' ? 'GDRFA Dubai status enquiry' : 'ICP File Validity')}</h3>
              <ol>{steps.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, '0')}</span>{t(s)}</li>)}</ol>
              <div className="vsp-row">
                <a className="btn btn-gold" href={PORTALS[k].url} target="_blank" rel="noopener">{t(`Open ${PORTALS[k].name}`)} <Icon name="ext" size={16} /></a>
                <small>{t('Call centre')} <b>{PORTALS[k].call}</b></small>
              </div>
            </article>
          ))}
        </div>
        <div className="vsp-band">
          <div><b>{t('The portal says “No record found”, or you cannot tell which emirate issued the visa?')}</b><p>{t('Send us your details and we search both systems, then tell you your grace period and any fines.')}</p></div>
          <AskCheckButton label="Ask us to check" />
        </div>
      </section>

      {/* 02 · How it works */}
      <section className="block vsp" id="how" data-reveal>
        <p className="eyebrow vsp-k">02 · {t('How it works')}</p>
        <h2>{t('We check it for you in three steps')}</h2>
        <p className="lead-s">{t('No government login and no UAE PASS. You give us four details from your passport, and someone from our team looks up the file on the official system.')}</p>
        <div className="vsp-3">
          {[['Fill in your details', 'The passport number and expiry date plus your nationality and date of birth, copied exactly from the passport itself.', 'passport'],
            ['Send them on WhatsApp', 'The form turns them into a WhatsApp message that you send to us yourself. This website does not store them.', 'wa'],
            ['Get a plain answer', 'We search GDRFA or ICP, then tell you in everyday words how long the file is valid, how much grace period is left and whether any fines are due.', 'check']].map(([h, p, ic], i) => (
            <div key={h} className="vsp-step card"><span className="vsp-n">{String(i + 1).padStart(2, '0')}</span><span className="vsp-ic"><Icon name={ic} size={20} /></span><h3>{t(h)}</h3><p>{t(p)}</p></div>
          ))}
        </div>
        <div className="vsp-why">
          <Icon name="shield" size={22} />
          <div><b>{t('Why we ask for more than a passport number')}</b><p>{t('UAE systems protect personal records with a second check. A passport number alone will not open a file, so both portals, and we, also need your nationality and date of birth before any search will run.')}</p></div>
          <a className="btn btn-glass" href="#checker">{t('Start the check')}</a>
        </div>
      </section>

      {/* 03 · Complete guide */}
      <section className="block vsp vsp-guide" id="guide" data-reveal data-nofx="">
        <p className="eyebrow vsp-k">03 · {t('Complete guide')}</p>
        <h2>{t('How to check a UAE visa status online')}</h2>
        <div className="vsp-gwrap">
          <nav className="vsp-toc" aria-label={t('In this guide')}>
            <p className="eyebrow">{t('In this guide')}</p>
            <ol>{GUIDE.map((g) => <li key={g.id}><a href={`#vs-${g.id}`}>{t(g.t)}</a></li>)}</ol>
            <AskCheckButton label="Ask us to check" className="btn btn-gold" />
          </nav>
          <div className="vsp-art">
            <p>{t('Whether you have just landed on a tourist visa or you manage residence visas for the whole family, it pays to check your visa status regularly. Knowing the real end date protects you from overstay fines, travel bans and trouble when you switch from one visa to another.')}</p>
            {GUIDE.map((g, i) => (
              <article key={g.id} id={`vs-${g.id}`} className="vsp-sec">
                <h3><span>{String(i + 1).padStart(2, '0')}</span>{t(g.t)}</h3>
                {g.p.map((x) => <p key={x}>{t(x)}</p>)}
                {g.extra === 'grace' && (
                  <div className="vsp-grace">
                    <p className="eyebrow">{t('Typical grace periods')}</p>
                    <dl>
                      {[['Most residence visas', '30 days'], ['Property owners', '90 days'], ['Golden and Green visas, including sponsored family', 'Up to 180 days'], ['Visit and tourist visas', 'Usually none']].map(([a, b]) => <div key={a}><dt>{t(a)}</dt><dd>{t(b)}</dd></div>)}
                    </dl>
                    <p className="vsp-fine"><Icon name="bell" size={16} /> {t('Overstay fines grow by AED 50 every day. Check your status before you book a flight.')}</p>
                  </div>
                )}
                {g.extra === 'auth' && (
                  <div className="vsp-auth">
                    <div className="card"><b>GDRFA Dubai</b><p>{t('The General Directorate of Residency and Foreigners Affairs keeps the files for every visa issued in Dubai. A Dubai status check searches this system.')}</p></div>
                    <div className="card"><b>ICP</b><p>{t('The Federal Authority for Identity, Citizenship, Customs and Port Security keeps the files for visas from the other six emirates: Abu Dhabi, Ajman, Fujairah, Ras Al Khaimah, Sharjah and Umm Al Quwain.')}</p></div>
                  </div>
                )}
                {g.extra === 'portal' && (
                  <ol className="vsp-ol">{['Go to the ICP Smart Services website.', 'Open Public Services in the top menu.', 'Pick File Validity.', 'Choose how to search, for example by Passport Information.', 'Type your passport number, nationality and date of birth, or your file number.', 'Submit to see the status and validity of your visa file.'].map((x) => <li key={x}>{t(x)}</li>)}</ol>
                )}
                {g.extra === 'ours' && (
                  <>
                    <ol className="vsp-ol">{['Fill in the form with the passport number and expiry date, your nationality and your date of birth.', 'Press “Send on WhatsApp” to pass the details to our team.', 'Wait for our reply on WhatsApp with a clear update on your status.'].map((x) => <li key={x}>{t(x)}</li>)}</ol>
                    <AskCheckButton label="Ask us to check" />
                  </>
                )}
                {g.note && <p className="vsp-note"><Icon name="check" size={16} /> {t(g.note)}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="block faq" id="questions" data-reveal data-nofx="">
        <div className="bh"><h2>{t('Visa status questions, answered')}</h2></div>
        {VISA_STATUS_FAQ.map((f, k) => (
          <details key={f.q} open={k === 0}>
            <summary>{t(f.q)}<i aria-hidden="true">+</i></summary>
            <p>{t(f.a)}</p>
          </details>
        ))}
      </section>

      {/* Related + final call */}
      <section className="block vsp" data-reveal>
        <div className="bh"><h2>{t('Related services')}</h2></div>
        <div className="vsp-rel">
          {[['/eligibility-check/', 'Golden Visa eligibility check', 'See which 10-year route may suit you, in about a minute.'], ['/golden-visa-cost/', 'Golden Visa cost', 'Every government fee for you and your family, person by person.'], ['/how-to-apply/', 'How to apply', 'The steps from eligibility to Emirates ID delivery.'], ['/requirements-documents/', 'Requirements & documents', 'What to prepare before you apply.']].map(([href, h, p]) => (
            <L key={href} locale={locale} href={href} className="vsp-relc card"><b>{t(h)}</b><small>{t(p)}</small><span>{t('Open')} →</span></L>
          ))}
        </div>
        <div className="vsp-final">
          <div><h2>{t('Not sure where your visa stands?')}</h2><p>{t('Send us your passport details on WhatsApp and our team checks your file on the official portal, free.')}</p></div>
          <div className="vsp-final-a">
            <AskCheckButton label="Send my passport details" />
            <a className="btn btn-glass" href={wa} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {t('Ask on WhatsApp')}</a>
          </div>
        </div>
        <p className="vsp-legal">{t(`${SITE.name} is operated by ${SITE.operator || 'Brightlink Management Consultancy L.L.C.'}, licensed by Dubai’s Department of Economy and Tourism. We are a private service provider, not a government authority. This page does not connect to GDRFA or ICP: visa records are held only by those authorities, and our team reads them on the official portals when you ask us to.`)}</p>
      </section>
    </>
  );
}
