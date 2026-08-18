export type Locale = 'vi' | 'en';

export function localize(vi: string, en: string, locale: Locale): string {
  if (locale === 'en') {
    return en.trim().length > 0 ? en : vi;
  }
  return vi;
}
