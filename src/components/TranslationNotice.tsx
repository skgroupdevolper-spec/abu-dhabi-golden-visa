import { DEFAULT_LOCALE, localeInfo, type Locale } from '@/lib/i18n';

/** Honest notice while a language's content is being translated (Phase 3 adds the translator). */
export function TranslationNotice({ locale }: { locale: Locale }) {
  if (locale === DEFAULT_LOCALE) return null;
  return (
    <p className="notice" lang="en">
      {localeInfo(locale).native}: translation in progress. This page is shown in English for now.
    </p>
  );
}
