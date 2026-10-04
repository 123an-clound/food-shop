import type { Testimonial } from '@/lib/events/content';

export function TestimonialsSection({ testimonials, vi }: { testimonials: Testimonial[]; vi: boolean }) {
  if (testimonials.length === 0) return null;

  return <section className="section-space bg-[#f7f3ec]" aria-labelledby="testimonials-title">
    <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16">
      <div className="max-w-2xl">
        <p className="eyebrow text-[var(--brand-accent)]">{vi ? 'CẢM NHẬN KHÁCH HÀNG' : 'GUEST STORIES'}</p>
        <h2 id="testimonials-title" className="section-heading mt-5">{vi ? 'Những khoảnh khắc được chia sẻ' : 'Moments worth sharing'}</h2>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {testimonials.slice(0, 3).map((item) => <figure key={item.id} className="flex h-full flex-col border border-[#d9cebc] bg-white p-7 sm:p-9">
          <div className="text-lg tracking-[.2em] text-[var(--brand-accent)]">
            <span className="sr-only">{item.rating} / 5 {vi ? 'sao' : 'stars'}</span>
            <span aria-hidden="true">{'★'.repeat(item.rating)}<span className="text-[#cfc5b8]">{'★'.repeat(5 - item.rating)}</span></span>
          </div>
          <blockquote className="mt-6 flex-1 font-heading text-xl leading-relaxed sm:text-2xl">“{vi ? item.quote_vi : item.quote_en || item.quote_vi}”</blockquote>
          <figcaption className="mt-8 border-t border-[#e7dfd4] pt-5">
            <span className="font-semibold">{item.customer_name}</span>
            {item.event_label && <span className="mt-1 block text-sm text-[var(--brand-muted)]">{item.event_label}</span>}
          </figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}
