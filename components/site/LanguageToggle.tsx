'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Locale } from '@/lib/i18n/localize';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();

  function handleSelect(next: Locale) {
    setLocale(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => handleSelect('vi')}
        aria-pressed={locale === 'vi'}
        className={locale === 'vi' ? 'font-semibold text-burgundy underline' : 'text-charcoal/80'}
      >
        VI
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => handleSelect('en')}
        aria-pressed={locale === 'en'}
        className={locale === 'en' ? 'font-semibold text-burgundy underline' : 'text-charcoal/80'}
      >
        EN
      </button>
    </div>
  );
}
