import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
