import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { MapEmbed } from '@/components/site/MapEmbed';

export default async function ContactPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);
  const name = localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-3xl text-burgundy">{dict.common.contactHeading}</h1>
      <dl className="mt-6 grid gap-3 text-charcoal/80">
        <div>
          <dt className="font-medium text-charcoal">{dict.common.addressLabel}</dt>
          <dd>{restaurantInfo.address}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.phoneLabel}</dt>
          <dd>{restaurantInfo.phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.emailLabel}</dt>
          <dd>{restaurantInfo.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.openingHoursLabel}</dt>
          <dd>{restaurantInfo.opening_hours}</dd>
        </div>
      </dl>
      <div className="mt-8">
        <MapEmbed mapEmbedUrl={restaurantInfo.map_embed_url} title={name} />
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        {restaurantInfo.facebook_url && (
          <a
            href={restaurantInfo.facebook_url}
            className="text-burgundy underline"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
        )}
        {restaurantInfo.instagram_url && (
          <a
            href={restaurantInfo.instagram_url}
            className="text-burgundy underline"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        )}
      </div>
    </section>
  );
}
