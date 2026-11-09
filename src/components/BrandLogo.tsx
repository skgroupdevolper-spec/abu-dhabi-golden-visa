import { SITE } from '@/lib/site';

// Site logo: the gold coin (turning in 3D unless switched off) next to the Arabic and English name.
// Admin > Logo & brand can replace either image.
export function BrandLogo({ size, alt = 'Abu Dhabi Golden Visa' }: { size?: number; alt?: string }) {
  const b = SITE.brand ?? {};
  const mark = b.logoMark || '/brand/logo-coin.webp';
  const text = b.logoText || '/brand/logo-text.webp';
  return (
    <span className={`blogo${b.spin === false ? ' still' : ''}`} style={size ? { fontSize: size } : undefined}>
      <span className="bl-coin" aria-hidden="true"><img decoding="async" src={mark} alt="" width={74} height={74} /><img decoding="async" src={mark} alt="" width={74} height={74} /></span>
      <img decoding="async" className="bl-text" src={text} alt={alt} width={256} height={88} />
    </span>
  );
}

/** Full logo (coin + name in one image) for the admin, portal and pop-ups. */
export const fullLogo = () => SITE.brand?.logo || '/brand/logo.webp';
/** Round coin image used in the hero, chat and sign-in pages. */
export const coinImg = () => SITE.brand?.coin || '/brand/coin.webp';
