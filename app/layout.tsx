import type { Metadata } from 'next';
import { Playfair_Display, Be_Vietnam_Pro } from 'next/font/google';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Hương Việt | Tiệc cưới, sự kiện & ẩm thực Việt',
  description: 'Khám phá ý tưởng tiệc cưới, tổ chức sự kiện và thực đơn món Việt tại Hương Việt.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body className={`${playfair.variable} ${beVietnamPro.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
