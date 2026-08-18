import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { CategoryTabs } from '@/components/site/CategoryTabs';

export default async function MenuPage() {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([
    getCategories(supabase),
    getMenuItems(supabase),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <CategoryTabs categories={categories} items={items} locale={locale} />
    </section>
  );
}
