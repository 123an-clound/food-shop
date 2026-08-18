import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { LanguageToggle } from './LanguageToggle';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function renderWithProvider(initialLocale: 'vi' | 'en' = 'vi') {
  return render(
    <LanguageProvider initialLocale={initialLocale}>
      <LanguageToggle />
    </LanguageProvider>
  );
}

describe('LanguageToggle', () => {
  it('marks VI as pressed by default', () => {
    renderWithProvider('vi');
    expect(screen.getByText('VI')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to EN when the EN button is clicked', () => {
    renderWithProvider('vi');
    fireEvent.click(screen.getByText('EN'));
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('VI')).toHaveAttribute('aria-pressed', 'false');
  });
});
