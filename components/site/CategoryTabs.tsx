'use client';

import { useState } from 'react';
import { localize } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/localize';
import type { Category, MenuItem } from '@/lib/types';
import { DishCard } from './DishCard';

export function CategoryTabs({
  categories,
  items,
  locale,
}: {
  categories: Category[];
  items: MenuItem[];
  locale: Locale;
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const itemsForActive = items.filter((item) => item.category_id === activeId);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-gold/30 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            aria-pressed={category.id === activeId}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              category.id === activeId
                ? 'bg-burgundy text-ivory'
                : 'bg-transparent text-charcoal'
            }`}
          >
            {localize(category.name_vi, category.name_en, locale)}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {itemsForActive.map((item) => (
          <DishCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </div>
  );
}
