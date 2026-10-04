'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Mail, Phone, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { EventPackage, Testimonial } from '@/lib/events/content';
import type { MenuItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useBooking } from './BookingDialog';
import { TestimonialsSection } from './TestimonialsSection';

type GalleryPhoto = { src: string; altVi: string; altEn: string };

const slides = [
  { src: '/images/wedding-hero.png', vi: 'Nơi ngày trọng đại trở thành ký ức đẹp', en: 'Where your most meaningful day begins', eyebrowVi: 'HƯƠNG VIỆT · TIỆC CƯỚI & SỰ KIỆN', eyebrowEn: 'HUONG VIET · WEDDINGS & EVENTS' },
  { src: '/images/wedding-ceremony.png', vi: 'Mỗi chi tiết mang dấu ấn riêng của hai bạn', en: 'Every detail tells your story', eyebrowVi: 'KHÔNG GIAN CỦA RIÊNG BẠN', eyebrowEn: 'A CELEBRATION OF YOUR OWN' },
  { src: '/images/event-gala.png', vi: 'Không gian xứng tầm mọi cuộc gặp gỡ', en: 'A setting made for gathering', eyebrowVi: 'SỰ KIỆN ĐƯỢC CHĂM CHÚT', eyebrowEn: 'THOUGHTFULLY PLANNED EVENTS' },
];

const services = [
  { vi: 'Tiệc cưới', en: 'Weddings', descVi: 'Từ lễ thành hôn ấm cúng đến buổi tiệc lớn, phác họa một ngày thật riêng.', descEn: 'From an intimate ceremony to a grand reception, make the day feel like yours.', image: '/images/wedding-ceremony.png' },
  { vi: 'Sự kiện doanh nghiệp', en: 'Corporate events', descVi: 'Hội nghị, gala và tiệc tri ân trong không gian trang trọng, linh hoạt.', descEn: 'Conferences, galas and appreciation dinners in a versatile setting.', image: '/images/event-gala.png' },
  { vi: 'Tiệc riêng & kỷ niệm', en: 'Private celebrations', descVi: 'Sinh nhật, lễ kỷ niệm và những cuộc đoàn viên được chăm chút từ bàn tiệc.', descEn: 'Birthdays, anniversaries and family moments considered down to the table.', image: '/images/table-setting.jpg' },
];

const questions = [
  { vi: 'Nên liên hệ trước ngày tổ chức bao lâu?', en: 'When should I get in touch?', answerVi: 'Bạn có thể gửi yêu cầu ngay khi đã có ngày dự kiến. Lịch trống và phương án tổ chức cần được xác nhận trực tiếp.', answerEn: 'Contact us once you have a tentative date. Availability and the event plan must be confirmed directly.' },
  { vi: 'Có thể điều chỉnh thực đơn món Việt không?', en: 'Can the Vietnamese menu be tailored?', answerVi: 'Hãy tham khảo trang Thực đơn rồi chia sẻ khẩu vị, nhu cầu ăn kiêng và ngân sách. Thực đơn và báo giá cuối cùng cần được xác nhận.', answerEn: 'Browse the menu and share your preferences, dietary needs and budget. The final menu and quote require confirmation.' },
  { vi: 'Gói tiệc đã bao gồm những gì?', en: 'What is included in a package?', answerVi: 'Các gói hiển thị là gợi ý để bắt đầu trao đổi. Hạng mục, số khách, không gian và giá sẽ được thống nhất trong báo giá riêng.', answerEn: 'Displayed packages are starting concepts. Inclusions, guest count, venue and pricing are confirmed in a tailored quote.' },
  { vi: 'Tôi có thể đến xem không gian không?', en: 'Can I view the venue?', answerVi: 'Bạn có thể để lại thời gian thuận tiện để được tư vấn lịch tham quan. Vui lòng xác nhận trực tiếp trước khi đến.', answerEn: 'Leave a convenient time to arrange a visit. Please confirm before arriving.' },
];

export function HomeExperience({ name, phone, email, heroImage, gallery, packages, featuredMenu, testimonials }: {
  name: string; phone: string; email: string; heroImage?: string;
  gallery: GalleryPhoto[]; packages: EventPackage[]; featuredMenu: MenuItem[]; testimonials: Testimonial[];
}) {
  const { locale } = useLanguage();
  const openBooking = useBooking();
  const vi = locale === 'vi';
  const [slide, setSlide] = useState(0);
  const [pauseSlides, setPauseSlides] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const heroSlides = heroImage ? [{ ...slides[0], src: heroImage }, ...slides.slice(1)] : slides;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduceMotion || pauseSlides) return;
    const id = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 9000);
    return () => window.clearInterval(id);
  }, [reduceMotion, pauseSlides]);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '';
  const moveSlide = (direction: number) => setSlide((current) => (current + direction + slides.length) % slides.length);

  return (
    <div className="home-page">
      <section aria-label={vi ? 'Hình ảnh nổi bật' : 'Featured photos'} className="hero-shell" onMouseEnter={() => setPauseSlides(true)} onMouseLeave={() => setPauseSlides(false)} onFocusCapture={() => setPauseSlides(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPauseSlides(false); }}>
        <div className="hero-slides"><div key={heroSlides[slide].src} className={`hero-slide ${slide === 0 ? 'first-slide' : ''}`}><Image src={heroSlides[slide].src} alt="" fill priority={slide === 0} fetchPriority={slide === 0 ? 'high' : 'auto'} quality={60} sizes="100vw" className="object-cover" /></div></div>
        <div className="hero-shade" />
        <div className="hero-content mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <p className="eyebrow text-[#ead8bb]">{vi ? slides[slide].eyebrowVi : slides[slide].eyebrowEn}</p>
          <h1 className="mt-6 max-w-[880px] font-heading text-[clamp(3rem,6.7vw,7rem)] leading-[1.07] tracking-[-0.045em] text-white">{vi ? slides[slide].vi : slides[slide].en}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">{vi ? 'Không gian tiệc cưới và sự kiện được tạo nên từ cảm xúc, ẩm thực Việt và sự chăm chút trong từng khoảnh khắc.' : 'Weddings and events shaped by emotion, Vietnamese cuisine and care in every moment.'}</p>
          <div className="mt-9 flex flex-wrap items-center gap-5"><button type="button" onClick={openBooking} className="primary-cream-button">{vi ? 'Nhận tư vấn tiệc' : 'Plan your event'} <ArrowRight size={18} aria-hidden="true" /></button><a href="#gioi-thieu" className="inline-flex min-h-12 items-center gap-2 border-b border-white/70 text-sm font-semibold text-white hover:border-white">{vi ? 'Khám phá không gian' : 'Explore the venue'} <ArrowDown size={17} aria-hidden="true" /></a></div>
        </div>
        <div className="hero-controls"><button type="button" onClick={() => moveSlide(-1)} aria-label={vi ? 'Ảnh trước' : 'Previous photo'}><ArrowLeft size={22} aria-hidden="true" /></button><span className="text-xs tracking-[0.2em] text-white" aria-live="polite">0{slide + 1} / 0{slides.length}</span><button type="button" onClick={() => moveSlide(1)} aria-label={vi ? 'Ảnh tiếp theo' : 'Next photo'}><ArrowRight size={22} aria-hidden="true" /></button></div>
        <div className="hero-dots" role="group" aria-label={vi ? 'Chọn ảnh' : 'Select photo'}>{slides.map((item, index) => <button key={item.src} type="button" onClick={() => setSlide(index)} className={index === slide ? 'is-active' : ''} aria-label={`${vi ? 'Xem ảnh' : 'Show photo'} ${index + 1}`} aria-pressed={index === slide} />)}</div>
      </section>

      <section id="gioi-thieu" className="section-space scroll-mt-20 bg-[var(--brand-cream)]"><div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-[.88fr_1.12fr] lg:gap-20 lg:px-16"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'MỘT KHÔNG GIAN, NGÀN KỶ NIỆM' : 'A PLACE FOR MEANINGFUL MOMENTS'}</p><h2 className="section-heading mt-5">{vi ? 'Ngày đẹp nhất bắt đầu từ những điều được thấu hiểu' : 'A beautiful day begins with being understood'}</h2><p className="mt-7 max-w-xl leading-8 text-[var(--brand-muted)]">{vi ? 'Hương Việt gợi mở một không gian dành cho tiệc cưới, sự kiện và những dịp sum vầy. Từ bàn tiệc đến hương vị Việt, mỗi lựa chọn đều có thể bắt đầu bằng câu chuyện của bạn.' : 'Huong Viet brings weddings, events and gatherings together with thoughtful spaces and Vietnamese flavor. Every choice starts with your story.'}</p><Link href="/about" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-[var(--brand-ink)] font-semibold">{vi ? 'Tìm hiểu về chúng tôi' : 'Discover our story'} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className="relative aspect-[4/4.4] overflow-hidden sm:aspect-[5/4.5]"><Image src={heroImage || '/images/wedding-ceremony.png'} alt={vi ? 'Không gian lễ cưới trang nhã, hình minh họa' : 'Elegant wedding ceremony setting, illustrative image'} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" loading="lazy" /><div className="absolute bottom-0 left-0 bg-[var(--brand-cream)] px-5 py-4 font-heading text-xl sm:px-8 sm:py-5 sm:text-2xl">{vi ? 'Một ngày theo cách của bạn' : 'Your day, your way'}</div></div></div></section>

      <section id="dich-vu" className="section-space scroll-mt-20 bg-[var(--brand-sand)]"><div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16"><div className="grid gap-5 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'DỊCH VỤ CỦA CHÚNG TÔI' : 'OUR SERVICES'}</p><h2 className="section-heading mt-5 max-w-2xl">{vi ? 'Một dịp đặc biệt, một trải nghiệm riêng' : 'Made for your occasion'}</h2></div><p className="max-w-lg leading-8 text-[var(--brand-muted)]">{vi ? 'Từ buổi lễ thân mật đến sự kiện lớn, hãy bắt đầu bằng điều quan trọng nhất với bạn. Các phương án sẽ được tư vấn theo nhu cầu thực tế.' : 'From intimate ceremonies to larger occasions, begin with what matters most. Options are tailored to your needs.'}</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map((service, index) => <Link href="/services" key={service.vi} className="group bg-[var(--brand-cream)]"><div className="relative aspect-[4/5] overflow-hidden"><Image src={service.image} alt={vi ? `${service.vi}, ảnh minh họa` : `${service.en}, illustrative image`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy" /></div><div className="flex items-start justify-between gap-4 px-6 pb-7 pt-6"><div><span className="text-xs font-semibold tracking-[.22em] text-[var(--brand-accent)]">0{index + 1}</span><h3 className="mt-3 font-heading text-2xl">{vi ? service.vi : service.en}</h3><p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">{vi ? service.descVi : service.descEn}</p></div><ArrowRight size={19} className="mt-1 shrink-0" aria-hidden="true" /></div></Link>)}</div></div></section>

      <section id="goi-tiec" className="section-space bg-[var(--brand-cream)]"><div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'GỢI Ý GÓI TIỆC' : 'EVENT CONCEPTS'}</p><h2 className="section-heading mt-5">{vi ? 'Bắt đầu từ cảm hứng của bạn' : 'Start with your vision'}</h2></div><Link href="/packages" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">{vi ? 'Xem các gói tiệc' : 'Explore packages'} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{packages.slice(0, 3).map((item) => <article key={item.id} className="border border-[#d9cebc] bg-white"><div className="relative aspect-[16/10] overflow-hidden"><Image src={item.image_url || '/images/wedding-hero.png'} alt={vi ? `${item.name_vi}, ảnh minh họa` : `${item.name_en || item.name_vi}, illustrative image`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" loading="lazy" /></div><div className="p-6 sm:p-8"><p className="eyebrow text-[var(--brand-accent)]">{item.is_featured ? (vi ? 'NỔI BẬT' : 'FEATURED') : (vi ? 'DỊCH VỤ SỰ KIỆN' : 'EVENT SERVICE')}</p><h3 className="mt-3 font-heading text-2xl">{vi ? item.name_vi : item.name_en || item.name_vi}</h3><p className="mt-3 min-h-[84px] text-sm leading-7 text-[var(--brand-muted)]">{vi ? item.description_vi : item.description_en || item.description_vi}</p><p className="mt-5 border-t border-[#e1d8c9] pt-5 text-sm font-semibold">{item.starting_price ? `${vi ? 'Từ' : 'From'} ${formatPrice(item.starting_price)}` : (vi ? 'Báo giá theo nhu cầu' : 'Tailored quotation')}</p></div></article>)}</div><p className="mt-5 text-xs leading-6 text-[var(--brand-muted)]">{vi ? 'Gói tiệc và hình ảnh hiện mang tính gợi ý. Hạng mục, giá và lịch trống cần được xác nhận trực tiếp.' : 'Packages and images are illustrative. Inclusions, pricing and availability require confirmation.'}</p></div></section>

      <section id="thuc-don" className="section-space bg-[#29231e] text-white"><div className="mx-auto grid max-w-[1320px] gap-12 px-6 sm:px-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-16"><div><p className="eyebrow text-[#d7b889]">{vi ? 'ẨM THỰC VIỆT TRONG BỮA TIỆC' : 'VIETNAMESE CUISINE'}</p><h2 className="section-heading mt-5 text-white">{vi ? 'Một bàn tiệc để nhớ mãi' : 'A menu to remember'}</h2><p className="mt-6 max-w-md leading-8 text-white/75">{vi ? 'Hương vị ba miền là điểm khởi đầu cho thực đơn của một ngày đáng nhớ. Khám phá các món ăn mẫu và trao đổi để xây dựng lựa chọn phù hợp với dịp tiệc.' : 'Flavors from across Vietnam can shape a memorable celebration. Browse sample dishes and discuss a menu that fits your occasion.'}</p><Link href="/menu" className="primary-cream-button mt-9">{vi ? 'Khám phá thực đơn' : 'Browse the menu'} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className="border-t border-white/30">{featuredMenu.slice(0, 4).map((item, index) => <div key={item.id} className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-3 border-b border-white/25 py-5 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-5"><span className="font-heading text-xl text-[#d7b889]">0{index + 1}</span><div><h3 className="font-heading text-xl sm:text-2xl">{vi ? item.name_vi : item.name_en}</h3><p className="mt-2 text-sm leading-6 text-white/65">{vi ? item.description_vi : item.description_en}</p></div><span className="whitespace-nowrap text-xs text-[#d7b889] sm:text-sm">{formatPrice(item.price)}</span></div>)}{featuredMenu.length === 0 && <p className="py-8 text-white/70">{vi ? 'Thực đơn sẽ được cập nhật trong thời gian tới.' : 'The menu will be updated soon.'}</p>}</div></div></section>

      <section className="section-space bg-[var(--brand-sand)]"><div className="mx-auto grid max-w-[1320px] gap-12 px-6 sm:px-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:px-16"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'HÀNH TRÌNH CÙNG BẠN' : 'OUR PLANNING JOURNEY'}</p><h2 className="section-heading mt-5">{vi ? 'Từ ý tưởng đầu tiên đến ngày diễn ra' : 'From first idea to the big day'}</h2><p className="mt-6 leading-8 text-[var(--brand-muted)]">{vi ? 'Một quy trình rõ ràng giúp bạn dành nhiều thời gian hơn cho niềm vui của mình.' : 'A clear process helps you enjoy the occasion with confidence.'}</p></div><ol className="border-t border-[#c9bba7]">{(vi ? [['01', 'Chia sẻ mong muốn', 'Kể cho chúng tôi về dịp tiệc, ngày dự kiến, số khách và ngân sách.'], ['02', 'Gợi ý phương án', 'Trao đổi không gian, thực đơn và những hạng mục cần thiết.'], ['03', 'Thống nhất chi tiết', 'Xác nhận báo giá, lịch tổ chức và kế hoạch phối hợp.'], ['04', 'Tận hưởng khoảnh khắc', 'Chuẩn bị để bạn có thể hiện diện trọn vẹn trong ngày của mình.']] : [['01', 'Share your vision', 'Tell us about your date, guests and budget.'], ['02', 'Explore the options', 'Discuss space, menu and useful services.'], ['03', 'Confirm the details', 'Agree on the quote, date and plan.'], ['04', 'Enjoy the moment', 'Be fully present on your special day.']]).map(([number, title, detail]) => <li key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-[#c9bba7] py-6"><span className="font-heading text-2xl text-[var(--brand-accent)]">{number}</span><div><h3 className="font-heading text-xl sm:text-2xl">{title}</h3><p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">{detail}</p></div></li>)}</ol></div></section>

      <section id="thu-vien" className="section-space scroll-mt-20 bg-[var(--brand-cream)]"><div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'THƯ VIỆN CẢM HỨNG' : 'A GALLERY OF INSPIRATION'}</p><h2 className="section-heading mt-5">{vi ? 'Vẻ đẹp nằm trong từng chi tiết' : 'Beauty in every detail'}</h2></div><Link href="/gallery" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">{vi ? 'Xem tất cả hình ảnh' : 'View gallery'} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className="gallery-mosaic mt-10">{gallery.slice(0, 5).map((photo, index) => <div key={`${photo.src}-${index}`} className={`gallery-photo gallery-photo-${index + 1} relative overflow-hidden`}><Image src={photo.src} alt={vi ? photo.altVi : photo.altEn} fill sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" className="object-cover" loading="lazy" /></div>)}</div><p className="mt-5 text-xs text-[var(--brand-muted)]">{vi ? 'Hình ảnh minh họa cho phong cách tiệc; không đại diện cho không gian thực tế của nhà hàng.' : 'Illustrative event imagery; actual venue may differ.'}</p></div></section>

      <TestimonialsSection testimonials={testimonials} vi={vi} />

      <section id="faq" className="section-space bg-[var(--brand-sand)]"><div className="mx-auto grid max-w-[1320px] gap-12 px-6 sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:px-16"><div><p className="eyebrow text-[var(--brand-accent)]">{vi ? 'THÔNG TIN HỮU ÍCH' : 'GOOD TO KNOW'}</p><h2 className="section-heading mt-5">{vi ? 'Trước khi bắt đầu' : 'Before we begin'}</h2><p className="mt-6 max-w-sm leading-8 text-[var(--brand-muted)]">{vi ? 'Những câu hỏi thường gặp khi lên kế hoạch cho một dịp đặc biệt.' : 'Helpful answers while planning your occasion.'}</p><button type="button" onClick={openBooking} className="primary-green-button mt-8">{vi ? 'Gửi yêu cầu tư vấn' : 'Make an enquiry'} <ArrowRight size={18} aria-hidden="true" /></button></div><div className="border-t border-[#c9bba7]">{questions.map((item, index) => <details key={item.vi} className="faq-item group border-b border-[#c9bba7]" open={index === 0}><summary className="flex cursor-pointer list-none items-start justify-between gap-5 py-6 font-medium marker:hidden"><span>{vi ? item.vi : item.en}</span><Plus size={21} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-45" /></summary><p className="max-w-2xl pb-6 pr-8 text-sm leading-7 text-[var(--brand-muted)]">{vi ? item.answerVi : item.answerEn}</p></details>)}</div></div></section>

      <section className="relative min-h-[360px] overflow-hidden bg-[#29231e] text-center text-white sm:min-h-[440px]"><Image src="/images/wedding-hero.png" alt="" fill sizes="100vw" className="object-cover opacity-35" loading="lazy" /><div className="relative z-10 mx-auto flex min-h-[360px] max-w-3xl flex-col items-center justify-center px-6 py-16 sm:min-h-[440px]"><p className="eyebrow text-[#e6c89b]">{name}</p><h2 className="mt-5 font-heading text-4xl leading-tight sm:text-6xl">{vi ? 'Hãy cùng tạo nên một ngày thật đáng nhớ' : 'Let us create a day worth remembering'}</h2><button type="button" onClick={openBooking} className="primary-cream-button mt-8">{vi ? 'Bắt đầu lên kế hoạch' : 'Start planning'} <ArrowRight size={18} aria-hidden="true" /></button></div></section>

      <div className="floating-actions" role="group" aria-label={vi ? 'Liên hệ nhanh' : 'Quick contact'}>{phone && <a href={phoneHref} aria-label={`${vi ? 'Gọi điện' : 'Call'} ${phone}`} title={phone}><Phone size={19} aria-hidden="true" /></a>}{email && <a href={`mailto:${email}`} aria-label={`${vi ? 'Gửi email' : 'Email'} ${email}`} title={email}><Mail size={19} aria-hidden="true" /></a>}{showTop && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })} aria-label={vi ? 'Lên đầu trang' : 'Back to top'} title={vi ? 'Lên đầu trang' : 'Back to top'}><ArrowUp size={19} aria-hidden="true" /></button>}</div>
    </div>
  );
}
