// The 20 website languages. English is the default and has no URL prefix (/golden-visa/);
// every other language lives under its own prefix (/ar/golden-visa/).
export type Locale =
  | 'en' | 'ar' | 'ru' | 'tr' | 'zh' | 'fr' | 'de' | 'it' | 'es' | 'ro'
  | 'pt' | 'at' | 'pl' | 'hu' | 'hr' | 'sk' | 'cs' | 'hi' | 'id' | 'ur';

export type LocaleInfo = { code: Locale; name: string; native: string; htmlLang: string; dir: 'ltr' | 'rtl' };

export const LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', native: 'English', htmlLang: 'en', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', htmlLang: 'ar', dir: 'rtl' },
  { code: 'ru', name: 'Russian', native: 'Русский', htmlLang: 'ru', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', htmlLang: 'tr', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', htmlLang: 'zh-CN', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', htmlLang: 'fr', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', htmlLang: 'de', dir: 'ltr' },
  { code: 'it', name: 'Italian', native: 'Italiano', htmlLang: 'it', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', htmlLang: 'es', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', native: 'Română', htmlLang: 'ro', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', htmlLang: 'pt', dir: 'ltr' },
  { code: 'at', name: 'Austrian German', native: 'Deutsch (Österreich)', htmlLang: 'de-AT', dir: 'ltr' },
  { code: 'pl', name: 'Polish', native: 'Polski', htmlLang: 'pl', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', htmlLang: 'hu', dir: 'ltr' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski', htmlLang: 'hr', dir: 'ltr' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina', htmlLang: 'sk', dir: 'ltr' },
  { code: 'cs', name: 'Czech', native: 'Čeština', htmlLang: 'cs', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', htmlLang: 'hi', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', htmlLang: 'id', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', htmlLang: 'ur', dir: 'rtl' },
];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALE_CODES as string[]).includes(v);
}

export function localeInfo(code: string): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/** Adds the language prefix to an internal path ("/contact/" -> "/ar/contact/"). */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

/** Splits "/ar/contact/" into { locale: "ar", path: "/contact/" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const seg = pathname.split('/')[1];
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = pathname.slice(seg.length + 1) || '/';
    return { locale: seg, path: rest };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}
