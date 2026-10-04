import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getPublicRestaurantInfo } from '@/lib/supabase/public-data';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { BookingProvider } from '@/components/site/BookingDialog';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const restaurantInfo = await getPublicRestaurantInfo();

  return (
    <LanguageProvider initialLocale={locale}>
      <BookingProvider>
        <a href="#main-content" className="skip-link">{locale === 'vi' ? 'Chuyển đến nội dung' : 'Skip to content'}</a>
        <Navbar />
        <main id="main-content" className="pt-[76px]">{children}</main>
        <Footer restaurantInfo={restaurantInfo} />
      </BookingProvider>
    </LanguageProvider>
  );
}
