import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryManager } from '@/components/admin/GalleryManager';

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Nội dung</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Thư viện ảnh</h1></div>
      <GalleryManager images={images} />
    </div>
  );
}
