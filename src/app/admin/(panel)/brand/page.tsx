import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { Toggle } from '@/components/dash/Fields';
import { ImageField } from '@/components/dash/ImageField';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSite } from '@/lib/server/settings';
import { saveBrand } from '../../settings-actions';

export const metadata: Metadata = { title: 'Logo & brand' };

export default async function BrandPage() {
  await requireAdmin(FULL);
  const site = await getSite();
  const b = site.brand ?? {};
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Website</p><h1>Logo &amp; brand</h1></div><a className="btn" href="/" target="_blank" rel="noopener">View website ↗</a></div>
      <ActionForm action={saveBrand} className="panel form" >
        <p className="help full">Upload a new image or pick one from the media library. PNG, WebP or SVG with a transparent background looks best. Empty fields keep the built-in gold coin and name.</p>
        <ImageField name="logoText" label="Header logo: name" initial={b.logoText ?? ''} fallback="/brand/logo-text.webp" help="The Arabic and English name next to the coin in the website header and footer. About 3 : 1 wide." />
        <ImageField name="logoMark" label="Header logo: coin / symbol" initial={b.logoMark ?? ''} fallback="/brand/logo-coin.webp" help="The small round mark in front of the name. Square image." />
        <Toggle name="spin" label="Turn the coin in 3D" help="Off = the symbol stays still." on={b.spin !== false} />
        <ImageField name="logo" label="Full logo (one image)" initial={b.logo ?? ''} fallback="/brand/logo.webp" help="Used in the admin, the customer portal and the cost calculator." />
        <ImageField name="coin" label="Large coin" initial={b.coin ?? ''} fallback="/brand/coin.webp" help="The big coin in the home page hero, the chat window, sign-in pages and the offer pop-up. Square image." />
        <ImageField name="favicon" label="Browser tab icon (favicon)" initial={b.favicon ?? ''} fallback="/icon.png" help="Square PNG, at least 192 × 192." />
        <div className="full"><Submit>Save logo &amp; brand</Submit></div>
      </ActionForm>
    </>
  );
}
