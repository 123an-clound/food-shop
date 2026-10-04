import Image from 'next/image';
import type { Metadata } from 'next';
import { InteriorHero } from '@/components/site/InteriorHero';
import { ConsultationButton } from '@/components/site/ConsultationButton';
import { getServerLocale } from '@/lib/i18n/server-locale';

export const metadata: Metadata = {
  title: 'Dịch vụ tiệc cưới & sự kiện | Hương Việt',
  description: 'Tìm hiểu các lựa chọn tiệc cưới, sự kiện doanh nghiệp và tiệc riêng cùng ẩm thực Việt tại Hương Việt.',
  alternates: { canonical: '/services' },
  openGraph: { title: 'Tiệc cưới & sự kiện tại Hương Việt', images: ['/images/wedding-ceremony.png'] },
  twitter: { card: 'summary_large_image', images: ['/images/wedding-ceremony.png'] },
};

const offerings = [
  { id: 'weddings', titleVi: 'Tiệc cưới theo câu chuyện của hai bạn', titleEn: 'A wedding that tells your story', eyebrowVi: 'TIỆC CƯỚI', eyebrowEn: 'WEDDINGS', bodyVi: 'Từ khoảnh khắc đón khách đến nghi lễ và bữa tiệc, một ngày trọng đại xứng đáng được lên kế hoạch với sự lắng nghe. Chia sẻ phong cách bạn yêu thích để cùng phác họa bố cục không gian, thực đơn và nhịp chương trình.', bodyEn: 'From welcoming guests to the ceremony and banquet, plan your day with care. Share your preferred style to explore the setting, menu and flow of the celebration.', image: '/images/wedding-ceremony.png', pointsVi: ['Không gian & bố cục bàn tiệc', 'Gợi ý thực đơn Việt', 'Nghi lễ & trình tự chương trình'], pointsEn: ['Space and table layout', 'Vietnamese menu ideas', 'Ceremony and event flow'] },
  { id: 'corporate', titleVi: 'Sự kiện chỉn chu cho những kết nối quan trọng', titleEn: 'Events for meaningful business connections', eyebrowVi: 'DOANH NGHIỆP', eyebrowEn: 'CORPORATE', bodyVi: 'Hội nghị, gala, tiệc tri ân hay buổi gặp gỡ đối tác đều cần một không gian thể hiện đúng tinh thần của thương hiệu. Chúng tôi cùng bạn trao đổi về quy mô, cách phục vụ và trải nghiệm dành cho khách mời.', bodyEn: 'Conferences, galas and partner gatherings need the right setting. Discuss scale, service style and guest experience with our team.', image: '/images/event-gala.png', pointsVi: ['Tiếp đón & bàn tiệc', 'Phương án phục vụ theo quy mô', 'Tư vấn chương trình'], pointsEn: ['Guest welcome and dining', 'Scale-appropriate service', 'Program consultation'] },
  { id: 'private', titleVi: 'Những dịp sum vầy đáng được nâng niu', titleEn: 'Personal occasions worth cherishing', eyebrowVi: 'TIỆC RIÊNG', eyebrowEn: 'PRIVATE EVENTS', bodyVi: 'Sinh nhật, lễ kỷ niệm hay buổi đoàn viên là dịp để dành trọn sự chú ý cho người thân. Bàn tiệc và thực đơn có thể được trao đổi theo sở thích của gia đình.', bodyEn: 'Birthdays, anniversaries and reunions bring loved ones together. Explore a table and menu that fit your family.', image: '/images/table-setting.jpg', pointsVi: ['Tư vấn phong cách tiệc', 'Lựa chọn món ăn', 'Không gian gặp gỡ'], pointsEn: ['Celebration styling', 'Menu selection', 'Gathering space'] },
];

export default async function ServicesPage() {
  const vi = (await getServerLocale()) === 'vi';
  return <>
    <InteriorHero eyebrow={vi ? 'TIỆC CƯỚI & SỰ KIỆN' : 'WEDDINGS & EVENTS'} title={vi ? 'Dành cho những khoảnh khắc không thể lặp lại' : 'For moments that happen only once'} description={vi ? 'Khám phá các dịch vụ và bắt đầu lên kế hoạch phù hợp với câu chuyện, số khách và mong muốn của bạn.' : 'Explore services and begin planning around your story, guests and wishes.'} image="/images/wedding-ceremony.png" />
    {offerings.map((item, index) => <section id={item.id} key={item.id} className={`section-space scroll-mt-20 ${index % 2 ? 'bg-[var(--brand-sand)]' : 'bg-[var(--brand-cream)]'}`}><div className={`mx-auto grid max-w-[1320px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}><div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={vi ? `${item.eyebrowVi}, ảnh minh họa` : `${item.eyebrowEn}, illustrative image`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" loading="lazy" /></div><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? item.eyebrowVi : item.eyebrowEn}</p><h2 className="section-heading mt-5">{vi ? item.titleVi : item.titleEn}</h2><p className="mt-6 leading-8 text-[var(--brand-muted)]">{vi ? item.bodyVi : item.bodyEn}</p><ul className="mt-8 border-t border-[#c9bba7]">{(vi ? item.pointsVi : item.pointsEn).map((point, pointIndex) => <li key={point} className="flex gap-5 border-b border-[#c9bba7] py-4"><span className="font-heading text-xl text-[var(--brand-accent)]">0{pointIndex + 1}</span><span>{point}</span></li>)}</ul><ConsultationButton className="primary-green-button mt-8" /></div></div></section>)}
    <p className="bg-[var(--brand-cream)] px-6 pb-12 text-center text-xs text-[var(--brand-muted)]">{vi ? 'Hình ảnh và mô tả dịch vụ mang tính giới thiệu; vui lòng liên hệ để xác nhận phương án thực tế.' : 'Images and service descriptions are illustrative; please contact us to confirm actual options.'}</p>
  </>;
}
