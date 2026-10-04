import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getPublicEventPackages, getPublicFeaturedMenu, getPublicHomeGallery, getPublicRestaurantInfo, getPublicTestimonials } from '@/lib/supabase/public-data';
import { HomeExperience } from '@/components/site/HomeExperience';
import { publicBrandName, publicContact } from '@/lib/site-contact';

export const metadata: Metadata = {
  title: 'Hương Việt | Nhà hàng tiệc cưới & tổ chức sự kiện',
  description: 'Khám phá không gian tiệc cưới, sự kiện và thực đơn món Việt tại Hương Việt. Gửi yêu cầu tư vấn cho ngày đặc biệt của bạn.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hương Việt | Nhà hàng tiệc cưới & tổ chức sự kiện',
    description: 'Không gian tiệc cưới và sự kiện cùng cảm hứng ẩm thực Việt.',
    images: [{ url: '/images/wedding-hero.png', width: 1672, height: 941, alt: 'Không gian tiệc cưới, hình minh họa' }],
  },
  twitter: { card: 'summary_large_image', title: 'Hương Việt | Nhà hàng tiệc cưới & tổ chức sự kiện', images: ['/images/wedding-hero.png'] },
};

const stockGallery = [
  { src: '/images/wedding-hero.png', altVi: 'Sảnh tiệc cưới, hình minh họa', altEn: 'Wedding banquet hall, illustrative image' },
  { src: '/images/wedding-ceremony.png', altVi: 'Không gian lễ cưới, hình minh họa', altEn: 'Wedding ceremony setting, illustrative image' },
  { src: '/images/event-gala.png', altVi: 'Không gian sự kiện, hình minh họa', altEn: 'Event gala setting, illustrative image' },
  { src: '/images/table-setting.jpg', altVi: 'Bàn tiệc được chuẩn bị trong nhà hàng, ảnh minh họa', altEn: 'An elegantly set dining table, illustrative photo' },
  { src: '/images/fine-dining.jpg', altVi: 'Món ăn trình bày tinh tế, ảnh minh họa', altEn: 'Thoughtfully plated dining, illustrative photo' },
];

export default async function HomePage() {
  const locale = await getServerLocale();
  const [restaurantInfo, galleryImages, featuredMenu, packages, testimonials] = await Promise.all([
    getPublicRestaurantInfo(),
    getPublicHomeGallery(),
    getPublicFeaturedMenu(),
    getPublicEventPackages(),
    getPublicTestimonials(),
  ]);
  const brandedGallery = galleryImages.filter((image) => !image.image_url.includes('picsum.photos'));
  const contact = publicContact(restaurantInfo);
  const gallery = brandedGallery.length >= 5
    ? brandedGallery.slice(0, 5).map((image) => ({
        src: image.image_url,
        altVi: image.caption_vi || 'Không gian Hương Việt',
        altEn: image.caption_en || image.caption_vi || 'Huong Viet gallery',
      }))
    : stockGallery;

  return <HomeExperience
    name={publicBrandName(restaurantInfo, locale)}
    phone={contact.phone}
    email={contact.email}
    heroImage={restaurantInfo.hero_image_url && !restaurantInfo.hero_image_url.includes('picsum.photos') ? restaurantInfo.hero_image_url : undefined}
    gallery={gallery}
    packages={packages}
    featuredMenu={featuredMenu}
    testimonials={testimonials}
  />;
}
