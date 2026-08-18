import type { Metadata } from 'next';
import { Playfair_Display, Be_Vietnam_Pro } from 'next/font/google';
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
  title: 'Hương Việt | Huong Viet Fine Dining',
  description: 'Tinh hoa ẩm thực ba miền — The Soul of Vietnamese Cuisine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${playfair.variable} ${beVietnamPro.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
