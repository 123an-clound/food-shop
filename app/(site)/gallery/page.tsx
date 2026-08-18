import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryGrid } from '@/components/site/GalleryGrid';

export default async function GalleryPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 font-heading text-3xl text-burgundy">{dict.common.ourSpaceHeading}</h1>
      <GalleryGrid images={images} locale={locale} />
    </section>
  );
}
