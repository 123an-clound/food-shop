import { describe, it, expect } from 'vitest';
import robots from './robots';

describe('robots', () => {
  it('disallows /admin and points to the sitemap', () => {
    const result = robots();

    expect(result.rules).toEqual([{ userAgent: '*', allow: '/', disallow: '/admin' }]);
    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });
});
