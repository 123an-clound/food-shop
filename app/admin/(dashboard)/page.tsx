import Link from 'next/link';
import { ArrowRight, CalendarHeart, ClipboardList, Images, UtensilsCrossed } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDashboardCounts } from '@/lib/supabase/admin-queries';
import { getEventDashboardStats, getEventInquiries } from '@/lib/supabase/events-admin';
import type { EventInquiry } from '@/lib/events/content';

const typeLabels: Record<EventInquiry['event_type'], string> = { wedding: 'Tiệc cưới', corporate: 'Sự kiện doanh nghiệp', private: 'Tiệc riêng', other: 'Khác' };

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const [counts, events, inquiries] = await Promise.all([
    getDashboardCounts(supabase), getEventDashboardStats(supabase), getEventInquiries(supabase),
  ]);
  const stats = [
    { label: 'Yêu cầu mới', count: events.newInquiries, href: '/admin/inquiries', icon: ClipboardList },
    { label: 'Tổng yêu cầu', count: events.totalInquiries, href: '/admin/inquiries', icon: ClipboardList },
    { label: 'Gói tiệc đang bật', count: events.activePackages, href: '/admin/packages', icon: CalendarHeart },
    { label: 'Món ăn', count: counts.menuItemCount, href: '/admin/menu-items', icon: UtensilsCrossed },
  ];

  return <div className="space-y-9">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Hương Việt · Quản trị</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Tổng quan</h1><p className="mt-2 text-sm text-muted-foreground">Theo dõi yêu cầu sự kiện và nội dung đang hiển thị.</p></div><Link href="/admin/inquiries" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Xử lý yêu cầu <ArrowRight size={17} aria-hidden="true" /></Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, count, href, icon: Icon }) => <Link href={href} key={label} className="rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-[var(--brand-accent)]"><div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon size={19} className="text-[var(--brand-accent)]" aria-hidden="true" /></div><p className="mt-5 font-heading text-4xl">{count}</p></Link>)}</div>
    <div className="grid gap-7 xl:grid-cols-[1.4fr_.6fr]"><section className="overflow-hidden rounded-lg border bg-card"><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-heading text-xl">Yêu cầu gần đây</h2><Link href="/admin/inquiries" className="text-sm font-semibold text-[var(--brand-accent)] hover:underline">Xem tất cả</Link></div>{inquiries.length ? <div className="divide-y">{inquiries.slice(0, 5).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{typeLabels[item.event_type]} · {item.guests} khách · {new Date(`${item.event_date}T12:00:00`).toLocaleDateString('vi-VN')}</p></div><span className="rounded-full bg-[var(--brand-sand)] px-3 py-1 text-xs font-medium">{item.status === 'new' ? 'Mới' : item.status === 'contacted' ? 'Đã liên hệ' : item.status === 'quoted' ? 'Đã báo giá' : item.status === 'confirmed' ? 'Đã xác nhận' : 'Đã đóng'}</span></div>)}</div> : <p className="px-5 py-10 text-sm text-muted-foreground">Chưa có yêu cầu tư vấn.</p>}</section><section className="rounded-lg border bg-card p-5"><h2 className="font-heading text-xl">Nội dung website</h2><div className="mt-5 grid gap-3 text-sm"><Link href="/admin/categories" className="flex items-center justify-between border-b pb-3 hover:text-[var(--brand-accent)]"><span>Danh mục món ăn</span><strong>{counts.categoryCount}</strong></Link><Link href="/admin/menu-items" className="flex items-center justify-between border-b pb-3 hover:text-[var(--brand-accent)]"><span>Món tạm hết</span><strong>{counts.unavailableMenuItemCount}</strong></Link><Link href="/admin/gallery" className="flex items-center justify-between border-b pb-3 hover:text-[var(--brand-accent)]"><span>Ảnh thư viện</span><strong>{counts.galleryImageCount}</strong></Link></div><Link href="/admin/testimonials" className="mt-6 flex items-center justify-between border-b pb-3 text-sm hover:text-[var(--brand-accent)]"><span>Đánh giá đang hiển thị</span><strong>{events.publishedTestimonials}</strong></Link><Link href="/admin/gallery" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-accent)]"><Images size={16} aria-hidden="true" />Quản lý thư viện</Link></section></div>
  </div>;
}
