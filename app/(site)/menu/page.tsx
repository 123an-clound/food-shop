import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { CategoryTabs } from '@/components/site/CategoryTabs';
import { InteriorHero } from '@/components/site/InteriorHero';

export const metadata: Metadata = {
  title: 'Thực đơn món Việt cho tiệc cưới & sự kiện | Hương Việt',
  description: 'Khám phá các món ăn Việt Nam để tham khảo cho tiệc cưới, sự kiện và những dịp gặp gỡ. Liên hệ để xây dựng thực đơn và nhận báo giá.',
  alternates: { canonical: '/menu' },
  openGraph: { title: 'Thực đơn món Việt | Hương Việt', description: 'Các món Việt cho ngày vui và những cuộc gặp gỡ.', images: ['/images/fine-dining.jpg'] },
  twitter: { card: 'summary_large_image', images: ['/images/fine-dining.jpg'] },
};

export default async function MenuPage() {
  const locale = await getServerLocale();
  const vi = locale === 'vi';
  const supabase = createPublicSupabaseClient();
  const [categories, items] = await Promise.all([getCategories(supabase), getMenuItems(supabase)]);

  return (
    <>
      <InteriorHero
        eyebrow={vi ? 'THỰC ĐƠN MÓN VIỆT' : 'VIETNAMESE MENU'}
        title={vi ? 'Hương vị Việt cho ngày vui trọn vẹn' : 'Vietnamese flavors for your celebration'}
        description={vi ? 'Tham khảo các món ăn theo từng nhóm để bắt đầu xây dựng bàn tiệc phù hợp với khách mời.' : 'Browse dishes by category to begin shaping a menu for your guests.'}
        image="/images/fine-dining.jpg"
      />
      <section className="section-space bg-[var(--brand-cream)]">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow text-[var(--brand-accent)]">{vi ? 'KHÁM PHÁ HƯƠNG VỊ' : 'EXPLORE THE FLAVORS'}</p>
            <h2 className="section-heading mt-5">{vi ? 'Một thực đơn mang dấu ấn của bạn' : 'A menu with your personal touch'}</h2>
            <p className="mt-5 leading-8 text-[var(--brand-muted)]">{vi ? 'Món ăn, mô tả và giá hiển thị là dữ liệu mẫu tham khảo; thực đơn và báo giá cho tiệc cần được xác nhận trực tiếp.' : 'Displayed dishes, descriptions and prices are sample references. Event menus and quotations require direct confirmation.'}</p>
          </div>
          <CategoryTabs categories={categories} items={items} locale={locale} />
        </div>
      </section>
    </>
  );
}
