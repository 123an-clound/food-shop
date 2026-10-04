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
    <div className="flex items-center gap-1 text-xs font-semibold text-[var(--brand-ink)]" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => handleSelect('vi')}
        aria-pressed={locale === 'vi'}
        className={`grid min-h-11 min-w-8 place-items-center ${locale === 'vi' ? 'underline underline-offset-4' : 'opacity-80 hover:opacity-100'}`}
      >
        VI
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => handleSelect('en')}
        aria-pressed={locale === 'en'}
        className={`grid min-h-11 min-w-8 place-items-center ${locale === 'en' ? 'underline underline-offset-4' : 'opacity-80 hover:opacity-100'}`}
      >
        EN
      </button>
    </div>
  );
}
