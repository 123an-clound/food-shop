import Image from 'next/image';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';

export default async function AboutPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);

  const description = localize(
    restaurantInfo.description_vi,
    restaurantInfo.description_en,
    locale
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-3xl text-burgundy">{dict.common.ourStoryHeading}</h1>
      <p className="mt-6 whitespace-pre-line text-charcoal/80">{description}</p>
      <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={restaurantInfo.hero_image_url}
          alt={localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale)}
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}
