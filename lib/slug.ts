// Matches Unicode combining diacritical marks (U+0300-U+036F) left behind
// after NFD normalization splits an accented letter into base + mark.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
