import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { CategoryTabs } from '@/components/site/CategoryTabs';

export default async function MenuPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([
    getCategories(supabase),
    getMenuItems(supabase),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 font-heading text-3xl text-burgundy">{dict.nav.menu}</h1>
      <CategoryTabs categories={categories} items={items} locale={locale} />
    </section>
  );
}
