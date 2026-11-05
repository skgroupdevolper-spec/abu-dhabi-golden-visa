import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="phero">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Page not found</p>
        <h1>This page has <em className="gold">moved or never existed.</em></h1>
        <p className="lead">Try the Golden Visa guide, the cost calculator or the free eligibility check.</p>
        <div className="cta" style={{ marginTop: 24 }}>
          <Link href="/" className="btn btn-red">Back to home</Link>
          <Link href="/golden-visa-cost/" className="btn btn-glass">Calculate visa cost</Link>
        </div>
      </div>
    </section>
  );
}
