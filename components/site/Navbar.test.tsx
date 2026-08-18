import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { Navbar } from './Navbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('Navbar', () => {
  it('renders Vietnamese nav labels by default', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Navbar />
      </LanguageProvider>
    );
    expect(screen.getByText('Thực đơn')).toBeInTheDocument();
    expect(screen.getByText('Liên hệ')).toBeInTheDocument();
  });

  it('renders English nav labels when initial locale is en', () => {
    render(
      <LanguageProvider initialLocale="en">
        <Navbar />
      </LanguageProvider>
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('hides the mobile nav panel until the menu button is toggled open', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Navbar />
      </LanguageProvider>
    );
    expect(screen.queryByRole('navigation', { name: /điều hướng/i })).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Mở menu điều hướng' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Đóng menu điều hướng' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /điều hướng/i })).toBeInTheDocument();
  });

  it('closes the mobile nav panel when a link inside it is clicked', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Navbar />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu điều hướng' }));
    const links = screen.getAllByText('Liên hệ');
    fireEvent.click(links[links.length - 1]);
    expect(screen.getByRole('button', { name: 'Mở menu điều hướng' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('closes the mobile nav panel on Escape', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Navbar />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu điều hướng' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Mở menu điều hướng' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
