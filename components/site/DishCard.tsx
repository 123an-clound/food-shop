import Image from 'next/image';
import { localize } from '@/lib/i18n/localize';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/localize';
import type { MenuItem } from '@/lib/types';

export function DishCard({ item, locale }: { item: MenuItem; locale: Locale }) {
  const dict = getDictionary(locale);
  const name = localize(item.name_vi, item.name_en, locale);
  const description = localize(item.description_vi, item.description_en, locale);

  return (
    <article className="overflow-hidden rounded-lg border border-gold/20 bg-white shadow-sm">
      <div className="relative aspect-square w-full">
        <Image
          src={item.image_url}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        {!item.is_available && (
          <span className="absolute right-2 top-2 rounded bg-charcoal/80 px-2 py-1 text-xs text-ivory">
            {dict.common.soldOutBadge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg text-charcoal">{name}</h3>
        {description && <p className="mt-1 text-sm text-charcoal/70">{description}</p>}
        <p className="mt-2 font-medium text-burgundy">{formatPrice(item.price)}</p>
      </div>
    </article>
  );
}
