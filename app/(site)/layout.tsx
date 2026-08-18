import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);

  return (
    <LanguageProvider initialLocale={locale}>
      <Navbar />
      <main>{children}</main>
      <Footer restaurantInfo={restaurantInfo} />
    </LanguageProvider>
  );
}
