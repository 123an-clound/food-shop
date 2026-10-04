'use client';

import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { RestaurantInfo } from '@/lib/types';
import { useBooking } from './BookingDialog';
import { isHttpsUrl } from '@/lib/security/external-url';
import { publicBrandName, publicContact } from '@/lib/site-contact';

export function Footer({ restaurantInfo }: { restaurantInfo: RestaurantInfo }) {
  const { locale } = useLanguage();
  const openBooking = useBooking();
  const vi = locale === 'vi';
  const name = publicBrandName(restaurantInfo, locale);
  const contact = publicContact(restaurantInfo);
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, '')}` : '';

  return (
    <footer className="bg-[#29231e] text-[#f8f6f1]">
      <div className="mx-auto max-w-[1440px] px-6 pb-7 pt-16 sm:px-10 lg:px-16 lg:pt-24">
        <div className="grid gap-12 border-b border-white/20 pb-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-20">
          <div>
            <Link href="/" className="font-heading text-4xl tracking-[-0.06em] sm:text-5xl">HƯƠNG VIỆT</Link>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d7b889]">Wedding & Events</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-[#ded8cf]">{vi ? 'Cùng bạn chuẩn bị tiệc cưới, sự kiện và những dịp sum vầy với cảm hứng ẩm thực Việt.' : 'Weddings, events and meaningful gatherings with the flavors of Vietnam.'}</p>
            <button type="button" onClick={openBooking} className="mt-7 inline-flex min-h-11 items-center gap-3 border border-[#c9a979] px-5 text-sm text-[#f8f6f1] transition-colors hover:bg-white/10">{vi ? 'Nhận tư vấn tiệc' : 'Plan an event'} <ArrowUpRight size={17} aria-hidden="true" /></button>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7b889]">{vi ? 'Khám phá' : 'Explore'}</h2>
            <nav aria-label={vi ? 'Liên kết cuối trang' : 'Footer links'} className="mt-7 grid gap-4 text-sm">
              <Link href="/services" className="w-fit hover:underline">{vi ? 'Tiệc cưới & sự kiện' : 'Weddings & events'}</Link>
              <Link href="/packages" className="w-fit hover:underline">{vi ? 'Gói tiệc' : 'Packages'}</Link>
              <Link href="/menu" className="w-fit hover:underline">{vi ? 'Thực đơn Việt' : 'Vietnamese menu'}</Link>
              <Link href="/gallery" className="w-fit hover:underline">{vi ? 'Thư viện ảnh' : 'Gallery'}</Link>
              <Link href="/contact" className="w-fit hover:underline">{vi ? 'Liên hệ' : 'Contact'}</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7b889]">{vi ? 'Thông tin liên hệ' : 'Contact'}</h2>
            <div className="mt-7 space-y-5 text-sm leading-6 text-[#ded8cf]">
              <p>{name}{contact.address && <><br />{contact.address}</>}</p>
              {contact.phone && <a href={phoneHref} className="flex w-fit items-center gap-3 hover:underline"><Phone size={17} aria-hidden="true" />{contact.phone}</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className="flex w-fit items-center gap-3 break-all hover:underline"><Mail size={17} aria-hidden="true" />{contact.email}</a>}
              {contact.openingHours && <p>{contact.openingHours}</p>}
              {!contact.phone && !contact.email && <p>{vi ? 'Gửi biểu mẫu tư vấn để chúng tôi tiếp nhận yêu cầu của bạn.' : 'Use the enquiry form to reach our team.'}</p>}
              <div className="flex gap-5 pt-1">
                {isHttpsUrl(contact.facebook) && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="grid min-h-11 place-items-center border border-white/30 px-3 text-xs hover:bg-white/10">Facebook</a>}
                {isHttpsUrl(contact.instagram) && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="grid min-h-11 place-items-center border border-white/30 px-3 text-xs hover:bg-white/10">Instagram</a>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-[#cfc6bb] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {name}. {vi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
          <p>{vi ? 'Hình ảnh minh họa; không gian và dịch vụ cần xác nhận trực tiếp.' : 'Illustrative imagery; venue and services require confirmation.'}</p>
        </div>
      </div>
    </footer>
  );
}
