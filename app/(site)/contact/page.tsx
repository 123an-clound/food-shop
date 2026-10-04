import type { Metadata } from 'next';
import { Mail, MapPin, Phone, Clock3 } from 'lucide-react';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getPublicRestaurantInfo } from '@/lib/supabase/public-data';
import { InteriorHero } from '@/components/site/InteriorHero';
import { MapEmbed } from '@/components/site/MapEmbed';
import { ConsultationButton } from '@/components/site/ConsultationButton';
import { isHttpsUrl } from '@/lib/security/external-url';
import { publicBrandName, publicContact } from '@/lib/site-contact';

export const metadata: Metadata = {
  title: 'Liên hệ tư vấn tiệc cưới & sự kiện | Hương Việt',
  description: 'Liên hệ Hương Việt để trao đổi về tiệc cưới, sự kiện và thực đơn món Việt. Gửi yêu cầu tư vấn hoặc gọi trực tiếp.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Liên hệ Hương Việt', images: ['/images/wedding-ceremony.png'] },
  twitter: { card: 'summary_large_image', images: ['/images/wedding-ceremony.png'] },
};

export default async function ContactPage() {
  const locale = await getServerLocale();
  const info = await getPublicRestaurantInfo();
  const vi = locale === 'vi';
  const name = publicBrandName(info, locale);
  const contact = publicContact(info);
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, '')}` : '';
  const hasRealMap = Boolean(contact.address) && isHttpsUrl(info.map_embed_url) && !info.map_embed_url.includes('0x0%3A0x0');

  return <>
    <InteriorHero
      eyebrow={vi ? 'CÙNG BẮT ĐẦU KẾ HOẠCH' : 'LET US BEGIN'}
      title={vi ? 'Kể chúng tôi nghe về dịp đặc biệt của bạn' : 'Tell us about your occasion'}
      description={vi ? 'Một lời chào, một ngày dự kiến và vài mong muốn là đủ để bắt đầu trao đổi.' : 'A date, a few ideas and a simple hello are all we need to start.'}
      image="/images/wedding-ceremony.png"
    />
    <section className="section-space bg-[var(--brand-cream)]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-6 sm:px-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-16">
        <div>
          <p className="eyebrow text-[var(--brand-accent)]">{vi ? 'LIÊN HỆ' : 'CONTACT'}</p>
          <h2 className="section-heading mt-5">{vi ? 'Mỗi buổi tiệc bắt đầu từ một cuộc trò chuyện' : 'Every celebration starts with a conversation'}</h2>
          <p className="mt-6 leading-8 text-[var(--brand-muted)]">{vi ? 'Chia sẻ ngày, số khách và loại hình sự kiện. Yêu cầu của bạn sẽ được lưu để đội ngũ tiếp tục tư vấn; lịch và chi phí chỉ được xác nhận sau khi trao đổi trực tiếp.' : 'Share your date, guests and event type. Your enquiry is saved for follow-up; availability and pricing are confirmed after a conversation.'}</p>
          <ConsultationButton className="primary-green-button mt-8" />
        </div>
        <div className="border-t border-[#c9bba7]">
          {contact.address && <div className="flex gap-5 border-b border-[#c9bba7] py-6"><MapPin className="mt-1 shrink-0" size={22} aria-hidden="true" /><div><h3 className="font-semibold">{vi ? 'Địa chỉ' : 'Address'}</h3><p className="mt-2 leading-7 text-[var(--brand-muted)]">{contact.address}</p></div></div>}
          {contact.phone && <div className="flex gap-5 border-b border-[#c9bba7] py-6"><Phone className="mt-1 shrink-0" size={22} aria-hidden="true" /><div><h3 className="font-semibold">{vi ? 'Điện thoại' : 'Phone'}</h3><a href={phoneHref} className="mt-2 inline-block text-[var(--brand-muted)] underline-offset-4 hover:underline">{contact.phone}</a></div></div>}
          {contact.email && <div className="flex gap-5 border-b border-[#c9bba7] py-6"><Mail className="mt-1 shrink-0" size={22} aria-hidden="true" /><div><h3 className="font-semibold">Email</h3><a href={`mailto:${contact.email}`} className="mt-2 inline-block break-all text-[var(--brand-muted)] underline-offset-4 hover:underline">{contact.email}</a></div></div>}
          {contact.openingHours && <div className="flex gap-5 border-b border-[#c9bba7] py-6"><Clock3 className="mt-1 shrink-0" size={22} aria-hidden="true" /><div><h3 className="font-semibold">{vi ? 'Giờ liên hệ' : 'Contact hours'}</h3><p className="mt-2 leading-7 text-[var(--brand-muted)]">{contact.openingHours}</p></div></div>}
          {!contact.address && !contact.phone && !contact.email && <p className="py-8 leading-7 text-[var(--brand-muted)]">{vi ? 'Thông tin địa điểm và liên hệ trực tiếp sẽ được cập nhật sau khi xác nhận. Hãy dùng biểu mẫu tư vấn để gửi yêu cầu.' : 'Venue and direct contact details will be added once confirmed. Please use the enquiry form.'}</p>}
        </div>
      </div>
    </section>
    {hasRealMap && <section className="bg-[var(--brand-sand)] px-6 pb-20 sm:px-10 sm:pb-28"><div className="mx-auto max-w-[1192px] overflow-hidden [&_iframe]:h-[360px] sm:[&_iframe]:h-[480px]"><MapEmbed mapEmbedUrl={info.map_embed_url} title={name} /></div></section>}
  </>;
}
