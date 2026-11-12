'use client';

// One-click mail provider settings for Admin > Settings > Email: fills in the host and port.
const P = [
  { n: 'Gmail / Google Workspace', h: 'smtp.gmail.com', p: 465, tip: 'Use an App Password (Google account > Security > 2-Step Verification > App passwords), not your normal password.' },
  { n: 'Outlook / Microsoft 365', h: 'smtp.office365.com', p: 587, tip: 'Use your full email and password. In Microsoft 365, SMTP AUTH must be enabled for the mailbox.' },
  { n: 'Zoho Mail', h: 'smtp.zoho.com', p: 465, tip: 'For accounts in India/EU use smtp.zoho.in / smtp.zoho.eu. With 2FA, create an app-specific password.' },
  { n: 'Hostinger', h: 'smtp.hostinger.com', p: 465, tip: 'Use the email account and password created in hPanel > Emails.' },
  { n: 'GoDaddy', h: 'smtpout.secureserver.net', p: 465, tip: 'Use your full GoDaddy email address and its password.' },
  { n: 'Own domain (cPanel)', h: 'mail.abudhabigoldenvisa.com', p: 465, tip: 'Use the mailbox created in cPanel > Email Accounts.' },
];

export function SmtpPresets() {
  const set = (name: string, v: string) => {
    const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
  };
  return (
    <div className="field full">
      <label>Quick setup: choose your email provider</label>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {P.map((x) => (
          <button key={x.n} type="button" className="btn btn-sm" onClick={(e) => {
            set('host', x.h); set('port', String(x.p));
            const t = (e.currentTarget.closest('.field') as HTMLElement).querySelector('.smtp-tip');
            if (t) t.textContent = `${x.n}: ${x.tip} Then press “Save and send a test email”.`;
          }}>{x.n}</button>
        ))}
      </div>
      <p className="help smtp-tip">Fills in the host and port. You only add your email address and password.</p>
    </div>
  );
}
