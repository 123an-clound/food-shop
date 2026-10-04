'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarHeart, Images, LayoutDashboard, LogOut, Menu, Settings2, Tags, UtensilsCrossed, X, ClipboardList, ExternalLink, MessageSquare } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/inquiries', label: 'Yêu cầu tư vấn', icon: ClipboardList },
  { href: '/admin/packages', label: 'Gói tiệc & sự kiện', icon: CalendarHeart },
  { href: '/admin/testimonials', label: 'Đánh giá khách hàng', icon: MessageSquare },
  { href: '/admin/menu-items', label: 'Món ăn', icon: UtensilsCrossed },
  { href: '/admin/categories', label: 'Danh mục món', icon: Tags },
  { href: '/admin/gallery', label: 'Thư viện ảnh', icon: Images },
  { href: '/admin/restaurant-info', label: 'Thông tin liên hệ', icon: Settings2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await createBrowserSupabaseClient().auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return <aside className="z-40 w-full shrink-0 border-b border-[#433a30] bg-[#29231e] text-[#f8f6f1] md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
    <div className="flex h-[70px] items-center justify-between border-b border-white/10 px-5 md:h-[92px]">
      <Link href="/admin" className="font-heading text-xl tracking-tight" onClick={() => setOpen(false)}>Hương Việt <span className="block font-body text-[10px] font-semibold uppercase tracking-[.25em] text-[#d7b889]">Quản trị sự kiện</span></Link>
      <button type="button" className="grid size-11 place-items-center md:hidden" aria-label={open ? 'Đóng menu quản trị' : 'Mở menu quản trị'} aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen((value) => !value)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
    </div>
    <nav id="admin-nav" aria-label="Quản trị" className={cn('px-3 py-4 md:block md:flex-1 md:overflow-y-auto', open ? 'block' : 'hidden')}>
      <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a883]">Điều hướng</p>
      <div className="grid gap-1">{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-white/10', active ? 'bg-[#e8dbc5] font-semibold text-[#29231e]' : 'text-white/80')}><Icon size={18} aria-hidden="true" />{label}</Link>;
      })}</div>
      <div className="mt-5 border-t border-white/10 pt-4"><Link href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-white/75 hover:bg-white/10"><ExternalLink size={18} aria-hidden="true" />Xem website</Link></div>
    </nav>
    <div className={cn('border-t border-white/10 p-3 md:block', open ? 'block' : 'hidden')}><button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-white/75 hover:bg-white/10"><LogOut size={18} aria-hidden="true" />Đăng xuất</button></div>
  </aside>;
}
