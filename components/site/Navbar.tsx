'use client';

import Link from 'next/link';
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
        <LanguageToggle />
      </div>
    </header>
  );
}
