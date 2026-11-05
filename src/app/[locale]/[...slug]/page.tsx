import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAGES, getPage } from '@/content/pages';
import { LOCALE_CODES, isLocale, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { PageView } from '@/components/PageView';

type Params = Promise<{ locale: string; slug: string[] }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALE_CODES.flatMap((locale) =>
    PAGES.map((p) => ({ locale, slug: p.path.split('/').filter(Boolean) })),
  );
}

function resolve(locale: string, slug: string[]) {
  const page = getPage('/' + slug.join('/') + '/');
  return { page, loc: (isLocale(locale) ? locale : 'en') as Locale };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const { page, loc } = resolve(locale, slug);
  if (!page) return {};
  return pageMetadata(page.path, loc, page.seoTitle, page.meta);
}

export default async function ContentPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const { page, loc } = resolve(locale, slug);
  if (!page) notFound();
  return <PageView page={page} locale={loc} />;
}
