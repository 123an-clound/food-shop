import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEventInquiries } from '@/lib/supabase/events-admin';
import { InquiryManager } from '@/components/admin/InquiryManager';

export default async function InquiriesPage() {
  const inquiries = await getEventInquiries(await createServerSupabaseClient());
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Khách hàng</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Yêu cầu tư vấn</h1><p className="mt-2 text-sm text-muted-foreground">Theo dõi, lọc và ghi chú từng yêu cầu. Danh sách hiển thị 500 yêu cầu gần nhất.</p></div>
    <InquiryManager inquiries={inquiries} />
  </div>;
}
