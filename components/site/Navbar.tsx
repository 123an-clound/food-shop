'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useBooking } from './BookingDialog';
import { LanguageToggle } from './LanguageToggle';

export function Navbar() {
  const { locale } = useLanguage();
  const openBooking = useBooking();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const vi = locale === 'vi';
  const left = [
    { href: '/services#weddings', label: vi ? 'Tiệc cưới' : 'Weddings' },
    { href: '/packages', label: vi ? 'Gói tiệc' : 'Packages' },
    { href: '/menu', label: vi ? 'Thực đơn' : 'Menu' },
  ];
  const right = [
    { href: '/services#corporate', label: vi ? 'Sự kiện' : 'Events' },
    { href: '/gallery', label: vi ? 'Hình ảnh' : 'Gallery' },
    { href: '/contact', label: vi ? 'Liên hệ' : 'Contact' },
  ];

  useEffect(() => {
    if (!isMenuOpen) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isMenuOpen]);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 bg-[#f8f6f1]/95 text-[var(--brand-ink)] backdrop-blur-md">
      <div className="mx-auto grid h-[76px] max-w-[1512px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 sm:px-8 xl:px-12">
        <nav aria-label={vi ? 'Điều hướng chính bên trái' : 'Primary navigation left'} className="hidden items-center gap-6 xl:flex 2xl:gap-9">
          {left.map((item) => <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>)}
        </nav>
        <div className="flex items-center xl:hidden">
          <button type="button" className="grid size-11 place-items-center" onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? (vi ? 'Đóng menu' : 'Close menu') : (vi ? 'Mở menu' : 'Open menu')} aria-expanded={isMenuOpen} aria-controls="mobile-nav">
            {isMenuOpen ? <X size={25} aria-hidden="true" /> : <Menu size={25} aria-hidden="true" />}
          </button>
        </div>
        <Link href="/" className="brand-mark justify-self-center text-center" onClick={() => setIsMenuOpen(false)}>
          <span className="block font-heading text-[1.65rem] leading-none tracking-[-0.055em] sm:text-[2rem]">HƯƠNG VIỆT</span>
          <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-accent)] sm:text-[9px]">Wedding & Events</span>
        </Link>
        <div className="flex items-center justify-end gap-4 xl:gap-6">
          <nav aria-label={vi ? 'Điều hướng chính bên phải' : 'Primary navigation right'} className="hidden items-center gap-6 xl:flex 2xl:gap-9">
            {right.map((item) => <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>)}
          </nav>
          <div className="hidden sm:block"><LanguageToggle /></div>
          <button type="button" onClick={openBooking} className="booking-cta hidden min-h-11 whitespace-nowrap bg-[var(--brand-ink)] px-5 text-xs font-semibold uppercase tracking-[0.05em] text-white transition-colors hover:bg-[#4b3d30] sm:inline-flex sm:items-center sm:justify-center">
            {vi ? 'Nhận tư vấn' : 'Enquire now'}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav id="mobile-nav" aria-label={vi ? 'Menu di động' : 'Mobile navigation'} className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-[#d8d1c4] bg-[var(--brand-cream)] px-6 pb-7 pt-3 xl:hidden">
          {[...left, ...right].map((item) => <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="block border-b border-[#ddd3c4] py-3.5 font-heading text-xl">{item.label}</Link>)}
          <div className="mt-5 flex items-center justify-between gap-4">
            <LanguageToggle />
            <button type="button" onClick={() => { setIsMenuOpen(false); openBooking(); }} className="min-h-11 bg-[var(--brand-ink)] px-5 text-sm font-semibold text-white">{vi ? 'Nhận tư vấn' : 'Enquire now'}</button>
          </div>
        </nav>
      )}
    </header>
  );
}
