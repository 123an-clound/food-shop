import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getPublicRestaurantInfo } from '@/lib/supabase/public-data';
import { InteriorHero } from '@/components/site/InteriorHero';
import { ConsultationButton } from '@/components/site/ConsultationButton';

export const metadata: Metadata = {
  title: 'Về Hương Việt | Không gian tiệc cưới & ẩm thực Việt',
  description: 'Tìm hiểu định hướng của Hương Việt: kết hợp không gian sự kiện trang nhã, ẩm thực Việt và sự chăm chút cho những dịp quan trọng.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'Về Hương Việt', images: ['/images/wedding-ceremony.png'] },
  twitter: { card: 'summary_large_image', images: ['/images/wedding-ceremony.png'] },
};

export default async function AboutPage() {
  const vi = (await getServerLocale()) === 'vi';
  const info = await getPublicRestaurantInfo();
  const brandImage = info.hero_image_url && !info.hero_image_url.includes('picsum.photos') ? info.hero_image_url : '/images/wedding-ceremony.png';
  return <>
    <InteriorHero eyebrow={vi ? 'CÂU CHUYỆN HƯƠNG VIỆT' : 'THE HUONG VIET STORY'} title={vi ? 'Dành tâm huyết cho những ngày đáng nhớ' : 'Thoughtful moments, beautifully shared'} description={vi ? 'Một tinh thần hiếu khách Việt trong không gian tiệc cưới, sự kiện và những buổi sum vầy.' : 'Vietnamese hospitality for weddings, events and moments together.'} image={brandImage} />
    <section className="section-space bg-[var(--brand-cream)]"><div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'ĐIỀU CHÚNG TÔI TRÂN TRỌNG' : 'WHAT MATTERS TO US'}</p><h2 className="section-heading mt-5">{vi ? 'Một bữa tiệc đẹp bắt đầu từ sự lắng nghe' : 'A beautiful event begins by listening'}</h2><p className="mt-7 leading-8 text-[var(--brand-muted)]">{vi ? 'Một tiệc cưới hay sự kiện đáng nhớ không chỉ nằm ở cách bài trí. Đó là lúc khách mời cảm thấy được chào đón, câu chuyện của chủ tiệc được thể hiện và những món ăn trở thành một phần của ký ức.' : 'A memorable wedding or event goes beyond decoration. Guests feel welcome, the host’s story comes through and the meal becomes part of the memory.'}</p><p className="mt-5 leading-8 text-[var(--brand-muted)]">{vi ? 'Hương Việt đặt cảm hứng ẩm thực Việt ở trung tâm của cuộc gặp gỡ. Bạn có thể khám phá thực đơn và cùng trao đổi cách kết hợp món ăn cho dịp của mình.' : 'Huong Viet places Vietnamese cuisine at the heart of every gathering. Explore the menu and discuss what suits your occasion.'}</p><Link href="/menu" className="primary-green-button mt-9">{vi ? 'Khám phá thực đơn' : 'Explore the menu'} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className="relative aspect-[4/5] overflow-hidden"><Image src="/images/table-setting.jpg" alt={vi ? 'Bàn tiệc được chuẩn bị, ảnh minh họa' : 'Banquet table setting, illustrative photo'} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" loading="lazy" /></div></div></section>
    <section className="section-space bg-[var(--brand-sand)]"><div className="mx-auto max-w-[1060px] px-6 text-center sm:px-10"><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'HƯỚNG ĐẾN TRẢI NGHIỆM RIÊNG' : 'AN EXPERIENCE OF YOUR OWN'}</p><h2 className="section-heading mx-auto mt-5 max-w-3xl">{vi ? 'Không gian, món ăn và con người cùng tạo nên một ngày trọn vẹn' : 'Space, cuisine and people make the moment'}</h2><div className="mt-12 grid gap-5 text-left md:grid-cols-3">{(vi ? [['Không gian', 'Bố cục và phong cách được trao đổi theo quy mô và tinh thần buổi tiệc.'], ['Ẩm thực Việt', 'Các món ăn trên thực đơn là điểm khởi đầu để lựa chọn hương vị phù hợp.'], ['Sự đồng hành', 'Từ cuộc trò chuyện đầu tiên đến các bước chuẩn bị cho ngày tổ chức.']] : [['The space', 'Layout and style are discussed around the size and character of your event.'], ['Vietnamese cuisine', 'Our menu is a starting point for a table that fits your guests.'], ['The journey', 'From the first conversation through the planning steps.']]).map(([title, body], index) => <article key={title} className="border-t border-[#bfae96] pt-6"><span className="font-heading text-2xl text-[var(--brand-accent)]">0{index + 1}</span><h3 className="mt-5 font-heading text-2xl">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">{body}</p></article>)}</div><ConsultationButton className="primary-green-button mt-12" /></div></section>
  </>;
}
