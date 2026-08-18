import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDashboardCounts } from '@/lib/supabase/admin-queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STAT_CARDS = [
  { key: 'menuItemCount', label: 'Tổng số món ăn', href: '/admin/menu-items' },
  { key: 'unavailableMenuItemCount', label: 'Món hết hàng', href: '/admin/menu-items' },
  { key: 'categoryCount', label: 'Danh mục', href: '/admin/categories' },
  { key: 'galleryImageCount', label: 'Ảnh gallery', href: '/admin/gallery' },
] as const;

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const counts = await getDashboardCounts(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Link key={stat.key} href={stat.href}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="text-3xl">{counts[stat.key]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
