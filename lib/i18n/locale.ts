import type { Locale } from './localize';

export const LOCALE_COOKIE_NAME = 'hv_locale';

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === 'en' ? 'en' : 'vi';
}
