import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

const PUBLIC_ROUTES = ['', '/services', '/packages', '/menu', '/about', '/gallery', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
