import { cookies } from 'next/headers';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n/locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
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
