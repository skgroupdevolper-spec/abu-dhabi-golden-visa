import Link from 'next/link';
import type { ComponentProps } from 'react';
import { localizePath, type Locale } from '@/lib/i18n';

/** Internal link that keeps the current language. */
export function L({ href, locale, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; locale: Locale }) {
  const external = /^https?:|^mailto:|^tel:/.test(href);
  if (external) return <a href={href} target="_blank" rel="noopener" {...(rest as unknown as ComponentProps<'a'>)} />;
  return <Link href={localizePath(href, locale)} {...rest} />;
}
