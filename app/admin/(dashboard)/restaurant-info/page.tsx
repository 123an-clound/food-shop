import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { RestaurantInfoForm } from '@/components/admin/RestaurantInfoForm';

export default async function RestaurantInfoPage() {
  const supabase = await createServerSupabaseClient();
  const info = await getRestaurantInfo(supabase);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Thông tin thương hiệu & liên hệ</h1>
      <p className="max-w-2xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">Dữ liệu liên hệ ban đầu là dữ liệu mẫu. Hãy cập nhật địa chỉ, điện thoại, email, giờ liên hệ và mạng xã hội đã xác thực trước khi công bố.</p>
      <RestaurantInfoForm info={info} />
    </div>
  );
}
