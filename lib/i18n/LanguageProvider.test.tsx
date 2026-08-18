import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageProvider';

function Consumer() {
  const { locale, setLocale } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale('en')}>switch to en</button>
    </div>
  );
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    document.cookie = 'hv_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('provides the initial locale to consumers', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Consumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('vi');
  });

  it('updates the locale and persists it to a cookie when setLocale is called', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Consumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('switch to en'));
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(document.cookie).toContain('hv_locale=en');
  });

  it('throws when useLanguage is used outside a LanguageProvider', () => {
    function Broken() {
      useLanguage();
      return null;
    }
    expect(() => render(<Broken />)).toThrow(
      'useLanguage must be used within a LanguageProvider'
    );
  });
});
