'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/menu-items', label: 'Món ăn' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/restaurant-info', label: 'Thông tin nhà hàng' },
  { href: '/admin/gallery', label: 'Thư viện ảnh' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-4">
        <p className="font-semibold">Hương Việt Admin</p>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
