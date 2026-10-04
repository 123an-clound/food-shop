import Image from 'next/image';
import type { Metadata } from 'next';
import { InteriorHero } from '@/components/site/InteriorHero';
import { ConsultationButton } from '@/components/site/ConsultationButton';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getPublicEventPackages } from '@/lib/supabase/public-data';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Gói tiệc cưới & sự kiện | Hương Việt',
  description: 'Tham khảo ý tưởng gói tiệc cưới, sự kiện doanh nghiệp và tiệc riêng tại Hương Việt. Nhận tư vấn thực đơn và báo giá theo nhu cầu.',
  alternates: { canonical: '/packages' },
  openGraph: { title: 'Gói tiệc tại Hương Việt', images: ['/images/event-gala.png'] },
  twitter: { card: 'summary_large_image', images: ['/images/event-gala.png'] },
};

export default async function PackagesPage() {
  const vi = (await getServerLocale()) === 'vi';
  const packages = await getPublicEventPackages();
  return <>
    <InteriorHero eyebrow={vi ? 'GỢI Ý CHO NGÀY ĐẶC BIỆT' : 'EVENT CONCEPTS'} title={vi ? 'Một gói tiệc vừa vặn với câu chuyện của bạn' : 'A celebration shaped around you'} description={vi ? 'Bắt đầu từ những gợi ý dưới đây, sau đó cùng điều chỉnh không gian, thực đơn và trải nghiệm theo nhu cầu thực tế.' : 'Start with these ideas, then tailor the space, menu and experience to your needs.'} image="/images/event-gala.png" />
    <section className="section-space bg-[var(--brand-cream)]"><div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16"><div className="max-w-3xl"><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'GÓI TIỆC' : 'PACKAGES'}</p><h2 className="section-heading mt-5">{vi ? 'Chọn điểm khởi đầu cho kế hoạch của bạn' : 'Choose a starting point'}</h2><p className="mt-5 leading-8 text-[var(--brand-muted)]">{vi ? 'Những gói sau là khung tham khảo. Hạng mục và giá thực tế được xác nhận trong báo giá riêng.' : 'These concepts are a starting point. Actual inclusions and pricing are confirmed in a tailored quote.'}</p></div><div className="mt-12 space-y-10">{packages.map((item, index) => <article key={item.id} className={`grid overflow-hidden border border-[#d9cebc] bg-white lg:grid-cols-2 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}><div className="relative min-h-[320px] lg:min-h-[470px]"><Image src={item.image_url || '/images/wedding-hero.png'} alt={vi ? `${item.name_vi}, ảnh minh họa` : `${item.name_en}, illustrative image`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" loading="lazy" /></div><div className="flex flex-col justify-center p-8 sm:p-12"><p className="eyebrow text-[var(--brand-accent)]">0{index + 1} / 0{packages.length}</p><h3 className="mt-5 font-heading text-3xl sm:text-4xl">{vi ? item.name_vi : item.name_en || item.name_vi}</h3><p className="mt-5 leading-8 text-[var(--brand-muted)]">{vi ? item.description_vi : item.description_en || item.description_vi}</p><ul className="mt-7 space-y-3 text-sm">{(vi ? item.inclusions_vi : item.inclusions_en.length ? item.inclusions_en : item.inclusions_vi).map((inclusion) => <li key={inclusion} className="border-l-2 border-[var(--brand-accent)] pl-4">{inclusion}</li>)}</ul><p className="mt-7 text-sm font-semibold">{item.starting_price ? `${vi ? 'Từ' : 'From'} ${formatPrice(item.starting_price)}` : (vi ? 'Báo giá theo nhu cầu' : 'Tailored quotation')}</p><ConsultationButton className="primary-green-button mt-7 w-fit" /></div></article>)}</div></div></section>
  </>;
}
