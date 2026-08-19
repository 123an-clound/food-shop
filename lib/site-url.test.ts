import { describe, it, expect, afterEach } from 'vitest';
import { getSiteUrl } from './site-url';

describe('getSiteUrl', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it('returns the configured site URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://huongvietrestaurant.vn';
    expect(getSiteUrl()).toBe('https://huongvietrestaurant.vn');
  });

  it('falls back to localhost when unset', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });
});
