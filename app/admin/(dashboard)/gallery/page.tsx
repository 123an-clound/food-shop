import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryManager } from '@/components/admin/GalleryManager';

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thư viện ảnh</h1>
      <GalleryManager images={images} />
    </div>
  );
}
