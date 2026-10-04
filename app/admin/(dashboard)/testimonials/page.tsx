import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTestimonials } from '@/lib/supabase/queries';
import { TestimonialManager } from '@/components/admin/TestimonialManager';

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials(await createServerSupabaseClient(), true);
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Nội dung</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Đánh giá khách hàng</h1><p className="mt-2 text-sm text-muted-foreground">Quản lý lời nhận xét được phép chia sẻ. Chỉ đánh giá đang bật mới xuất hiện trên trang chủ.</p></div>
    <TestimonialManager testimonials={testimonials} />
  </div>;
}
