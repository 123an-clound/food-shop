'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { LanguageToggle } from './LanguageToggle';

const NAV_ITEMS = [
  { href: '/', key: 'home' } as const,
  { href: '/menu', key: 'menu' } as const,
  { href: '/about', key: 'about' } as const,
  { href: '/gallery', key: 'gallery' } as const,
  { href: '/contact', key: 'contact' } as const,
];

export function Navbar() {
  const { locale } = useLanguage();
  const dict = getDictionary(locale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-heading text-xl text-burgundy">
          {locale === 'vi' ? 'Hương Việt' : 'Huong Viet'}
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-charcoal hover:text-burgundy"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button
            type="button"
            className="text-charcoal md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? dict.common.closeMenuLabel : dict.common.openMenuLabel}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav
          id="mobile-nav"
          aria-label={locale === 'vi' ? 'Điều hướng chính' : 'Main navigation'}
          className="flex flex-col gap-1 border-t border-gold/30 px-4 py-3 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded px-2 py-2 text-sm font-medium text-charcoal hover:bg-gold/10 hover:text-burgundy"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
