'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { RestaurantInfo } from '@/lib/types';

export function Footer({ restaurantInfo }: { restaurantInfo: RestaurantInfo }) {
  const { locale } = useLanguage();
  const dict = getDictionary(locale);
  const name = locale === 'vi' ? restaurantInfo.name_vi : restaurantInfo.name_en;

  return (
    <footer className="mt-16 border-t border-gold/30 bg-charcoal py-10 text-ivory">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-heading text-lg text-gold">{name}</p>
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="inline text-gold">{dict.common.addressLabel}: </dt>
            <dd className="inline">{restaurantInfo.address}</dd>
          </div>
          <div>
            <dt className="inline text-gold">{dict.common.phoneLabel}: </dt>
            <dd className="inline">{restaurantInfo.phone}</dd>
          </div>
          <div>
            <dt className="inline text-gold">{dict.common.openingHoursLabel}: </dt>
            <dd className="inline">{restaurantInfo.opening_hours}</dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}
