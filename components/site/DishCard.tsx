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
  const hasPhoto = Boolean(item.image_url) && !item.image_url.includes('picsum.photos');

  return (
    <article className="flex h-full flex-col overflow-hidden border border-[#ded4c5] bg-[#fffefa]">
      {hasPhoto && <div className="relative aspect-[4/3] w-full"><Image src={item.image_url} alt={name} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" loading="lazy" /></div>}
      <div className="flex flex-1 flex-col px-6 pb-6 pt-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-2xl leading-tight text-[var(--brand-ink)]">{name}</h3>
          {!item.is_available && <span className="shrink-0 border border-[#c9bba7] px-2 py-1 text-xs text-[var(--brand-muted)]">{dict.common.soldOutBadge}</span>}
        </div>
        {description && <p className="mt-4 flex-1 text-sm leading-7 text-[var(--brand-muted)]">{description}</p>}
        <p className="mt-7 border-t border-[#ded4c5] pt-4 text-sm font-semibold text-[var(--brand-ink)]">{formatPrice(item.price)}</p>
      </div>
    </article>
  );
}
