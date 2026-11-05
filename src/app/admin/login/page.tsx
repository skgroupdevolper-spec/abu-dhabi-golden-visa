import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, currentAdmin } from '@/lib/server/auth';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { login } from '../actions';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await currentAdmin()) redirect('/admin/');
  return (
    <main className="login">
      <div className="card reveal">
        <img className="coin" src="/brand/coin.webp" alt="" width={92} height={92} />
        <img src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" style={{ height: 46, width: 'auto', margin: '0 auto 18px' }} />
        <p className="eyebrow" style={{ textAlign: 'center' }}>Team dashboard</p>
        <h1 style={{ textAlign: 'center', marginTop: 8, fontSize: 34 }}>Welcome <span className="gold">back.</span></h1>
        {!adminConfigured() && <p className="notice err" style={{ marginTop: 16 }}>No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server, then restart.</p>}
        <ActionForm action={login} className="stack" >
          <div style={{ height: 8 }} />
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <Submit className="btn btn-gold" >Sign in</Submit>
        </ActionForm>
      </div>
    </main>
  );
}
