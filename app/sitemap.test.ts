import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('lists every public route as an absolute URL and excludes /admin', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/services',
      'http://localhost:3000/packages',
      'http://localhost:3000/menu',
      'http://localhost:3000/about',
      'http://localhost:3000/gallery',
      'http://localhost:3000/contact',
    ]);
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
  });
});
