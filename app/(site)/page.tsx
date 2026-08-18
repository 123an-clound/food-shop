import Image from 'next/image';
import Link from 'next/link';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getRestaurantInfo,
  getFeaturedMenuItems,
  getGalleryImages,
} from '@/lib/supabase/queries';
import { DishCard } from '@/components/site/DishCard';

export default async function HomePage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [restaurantInfo, featuredItems, galleryPreview] = await Promise.all([
    getRestaurantInfo(supabase),
    getFeaturedMenuItems(supabase, 6),
    getGalleryImages(supabase, 6),
  ]);

  const name = localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale);
  const tagline = localize(restaurantInfo.tagline_vi, restaurantInfo.tagline_en, locale);
  const description = localize(
    restaurantInfo.description_vi,
    restaurantInfo.description_en,
    locale
  );

  return (
    <>
      <section className="relative flex h-[70vh] min-h-[420px] items-end">
        <Image src={restaurantInfo.hero_image_url} alt={name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-ivory">
          <h1 className="font-heading text-4xl md:text-6xl">{name}</h1>
          <p className="mt-2 text-lg text-gold">{tagline}</p>
          <Link
            href="/menu"
            className="mt-6 inline-block rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory hover:bg-burgundy/90"
          >
            {dict.common.viewMenuCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-charcoal/80">{description}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl text-burgundy">{dict.common.featuredDishesHeading}</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <DishCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl text-burgundy">{dict.common.ourSpaceHeading}</h2>
          <Link href="/gallery" className="text-sm font-medium text-burgundy underline">
            {dict.common.viewMoreGallery}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {galleryPreview.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={image.image_url}
                alt={localize(image.caption_vi, image.caption_en, locale)}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 50vw"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
