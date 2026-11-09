import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, currentAdmin } from '@/lib/server/auth';
import { AdminLoginForm } from '@/components/dash/AdminLoginForm';
import { login } from '../actions';
import { coinImg, fullLogo } from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await currentAdmin()) redirect('/admin/');
  return (
    <main className="login">
      <div className="card reveal">
        <img className="coin" src={coinImg()} alt="" width={92} height={92} />
        <img src={fullLogo()} alt="Abu Dhabi Golden Visa" style={{ height: 46, width: 'auto', margin: '0 auto 18px' }} />
        <p className="eyebrow" style={{ textAlign: 'center' }}>Team dashboard</p>
        <h1 style={{ textAlign: 'center', marginTop: 8, fontSize: 34 }}>Welcome <span className="gold">back.</span></h1>
        {!adminConfigured() && <p className="notice err" style={{ marginTop: 16 }}>No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server, then restart.</p>}
        <AdminLoginForm action={login} />
      </div>
    </main>
  );
}
