import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { BookingProvider } from './BookingDialog';
import { Navbar } from './Navbar';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

function renderNavbar(locale: 'vi' | 'en' = 'vi') {
  return render(<LanguageProvider initialLocale={locale}><BookingProvider><Navbar /></BookingProvider></LanguageProvider>);
}

describe('Navbar', () => {
  it('renders the centered brand and Vietnamese links', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /HƯƠNG VIỆT.*Wedding & Events/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính bên trái' })).toHaveTextContent('Tiệc cưới');
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính bên phải' })).toHaveTextContent('Liên hệ');
  });

  it('renders English navigation when locale is en', () => {
    renderNavbar('en');
    expect(screen.getByRole('navigation', { name: 'Primary navigation left' })).toHaveTextContent('Weddings');
    expect(screen.getByRole('navigation', { name: 'Primary navigation right' })).toHaveTextContent('Contact');
  });

  it('opens and closes the mobile menu using its toggle', () => {
    renderNavbar();
    const toggle = screen.getByRole('button', { name: 'Mở menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Menu di động' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the mobile menu when a link is clicked', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu' }));
    fireEvent.click(screen.getByRole('navigation', { name: 'Menu di động' }).getElementsByTagName('a')[0]);
    expect(screen.queryByRole('navigation', { name: 'Menu di động' })).not.toBeInTheDocument();
  });

  it('closes the mobile menu on Escape', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Menu di động' })).not.toBeInTheDocument();
  });
});
