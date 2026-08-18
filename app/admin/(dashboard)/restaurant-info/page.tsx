import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { RestaurantInfoForm } from '@/components/admin/RestaurantInfoForm';

export default async function RestaurantInfoPage() {
  const supabase = await createServerSupabaseClient();
  const info = await getRestaurantInfo(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thông tin nhà hàng</h1>
      <RestaurantInfoForm info={info} />
    </div>
  );
}
