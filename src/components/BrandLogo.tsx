// Site logo: the gold coin turns in 3D next to the Arabic and English name.
export function BrandLogo({ size, alt = 'Abu Dhabi Golden Visa' }: { size?: number; alt?: string }) {
  return (
    <span className="blogo" style={size ? { fontSize: size } : undefined}>
      <span className="bl-coin" aria-hidden="true"><img decoding="async" src="/brand/logo-coin.webp" alt="" width={74} height={74} /><img decoding="async" src="/brand/logo-coin.webp" alt="" width={74} height={74} /></span>
      <img decoding="async" className="bl-text" src="/brand/logo-text.webp" alt={alt} width={256} height={88} />
    </span>
  );
}
