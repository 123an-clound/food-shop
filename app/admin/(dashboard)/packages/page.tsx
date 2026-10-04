import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEventPackages } from '@/lib/supabase/queries';
import { PackageManager } from '@/components/admin/PackageManager';

export default async function AdminPackagesPage() {
  const packages = await getEventPackages(await createServerSupabaseClient(), true);
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Nội dung</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Gói tiệc & sự kiện</h1><p className="mt-2 text-sm text-muted-foreground">Tạo và sửa gói tiệc. Gói đang bật được hiển thị ở trang công khai; nếu chưa có gói đang bật, trang sẽ dùng ba ý tưởng mẫu.</p></div>
    <PackageManager packages={packages} />
  </div>;
}
