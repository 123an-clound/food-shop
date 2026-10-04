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
      <div className="flex gap-2 overflow-x-auto border-b border-[#c9bba7] pb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            aria-pressed={category.id === activeId}
            className={`min-h-11 whitespace-nowrap border px-5 py-2 text-sm font-semibold transition-colors ${
              category.id === activeId
                ? 'border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white'
                : 'border-[#c9bba7] bg-transparent text-[var(--brand-ink)] hover:border-[var(--brand-ink)]'
            }`}
          >
            {localize(category.name_vi, category.name_en, locale)}
          </button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {itemsForActive.length ? itemsForActive.map((item) => (
          <DishCard key={item.id} item={item} locale={locale} />
        )) : <p className="text-[var(--brand-muted)]">{locale === 'vi' ? 'Hiện chưa có món trong nhóm này.' : 'No dishes in this category yet.'}</p>}
      </div>
    </div>
  );
}
