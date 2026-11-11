'use client';
// <T>English text</T> shows the text in the visitor's language (from the URL), using the website
// interface translations. Texts without a translation yet are collected and translated automatically.
import { usePathname } from 'next/navigation';
import { splitLocale } from '@/lib/i18n';
import { u } from '@/lib/ui';

export function useLoc(): string {
  const p = usePathname() || '/';
  return splitLocale(p).locale;
}

export function T({ children }: { children: string }) {
  const loc = useLoc();
  return <>{u(children, loc)}</>;
}
