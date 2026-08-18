import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryGrid } from '@/components/site/GalleryGrid';

export default async function GalleryPage() {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <GalleryGrid images={images} locale={locale} />
    </section>
  );
}
