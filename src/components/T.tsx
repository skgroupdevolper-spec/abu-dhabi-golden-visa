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

/** <Opt>English</Opt>: a select option shown in the visitor's language; the submitted value stays English. */
export function Opt({ children, value, disabled }: { children: string; value?: string; disabled?: boolean }) {
  const loc = useLoc();
  return <option value={value ?? children} disabled={disabled}>{u(children, loc)}</option>;
}
