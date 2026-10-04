import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { getGalleryImages } from '@/lib/supabase/queries';
import type { GalleryImage } from '@/lib/types';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { InteriorHero } from '@/components/site/InteriorHero';

export const metadata: Metadata = {
  title: 'Hình ảnh tiệc cưới & sự kiện | Hương Việt',
  description: 'Khám phá cảm hứng trang trí tiệc cưới, không gian sự kiện và bàn tiệc Việt tại Hương Việt.',
  alternates: { canonical: '/gallery' },
  openGraph: { title: 'Hình ảnh tiệc cưới & sự kiện Hương Việt', description: 'Cảm hứng cho một dịp đặc biệt.', images: ['/images/wedding-ceremony.png'] },
  twitter: { card: 'summary_large_image', images: ['/images/wedding-ceremony.png'] },
};

const stockImages: GalleryImage[] = [
  { id: 'stock-1', image_url: '/images/wedding-hero.png', caption_vi: 'Sảnh tiệc cưới, hình minh họa', caption_en: 'Wedding banquet hall, illustrative image', display_order: 1 },
  { id: 'stock-2', image_url: '/images/wedding-ceremony.png', caption_vi: 'Không gian lễ cưới, hình minh họa', caption_en: 'Wedding ceremony setting, illustrative image', display_order: 2 },
  { id: 'stock-3', image_url: '/images/event-gala.png', caption_vi: 'Không gian sự kiện, hình minh họa', caption_en: 'Event gala setting, illustrative image', display_order: 3 },
  { id: 'stock-4', image_url: '/images/table-setting.jpg', caption_vi: 'Bàn tiệc được chuẩn bị, ảnh minh họa', caption_en: 'A set dining table, illustrative photo', display_order: 4 },
  { id: 'stock-5', image_url: '/images/fine-dining.jpg', caption_vi: 'Món ăn được trình bày tinh tế, ảnh minh họa', caption_en: 'Thoughtfully plated food, illustrative photo', display_order: 5 },
  { id: 'stock-6', image_url: '/images/restaurant-night.jpg', caption_vi: 'Không gian nhà hàng về đêm, ảnh minh họa', caption_en: 'Restaurant interior at night, illustrative photo', display_order: 6 },
];

export default async function GalleryPage() {
  const locale = await getServerLocale();
  const vi = locale === 'vi';
  const images = await getGalleryImages(createPublicSupabaseClient());
  const brandImages = images.filter((image) => !image.image_url.includes('picsum.photos'));
  const hasCompleteBrandGallery = brandImages.length >= 5;

  return (
    <>
      <InteriorHero
        eyebrow={vi ? 'THƯ VIỆN CẢM HỨNG' : 'GALLERY OF INSPIRATION'}
        title={vi ? 'Một ngày đẹp trong từng khung hình' : 'A beautiful day in every frame'}
        description={vi ? 'Hình ảnh gợi ý về tiệc cưới, sự kiện, không gian và ẩm thực Việt.' : 'Ideas for weddings, events, thoughtful spaces and Vietnamese cuisine.'}
        image="/images/wedding-ceremony.png"
      />
      <section className="section-space bg-[var(--brand-cream)]">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16">
          <p className="eyebrow text-[var(--brand-accent)]">{vi ? 'HÌNH ẢNH' : 'THE GALLERY'}</p>
          <h2 className="section-heading mt-5">{vi ? 'Cảm hứng cho ngày của bạn' : 'Inspiration for your occasion'}</h2>
          <p className="mb-10 mt-5 max-w-2xl leading-8 text-[var(--brand-muted)]">{hasCompleteBrandGallery ? (vi ? 'Hình ảnh được cập nhật từ thư viện của Hương Việt.' : 'Images from the Huong Viet gallery.') : (vi ? 'Hình ảnh minh họa cho phong cách tiệc; ảnh thương hiệu sẽ được cập nhật khi có sẵn.' : 'Illustrative event images until brand photography is available.')}</p>
          <GalleryGrid images={hasCompleteBrandGallery ? brandImages : stockImages} locale={locale} />
        </div>
      </section>
    </>
  );
}
