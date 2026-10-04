'use server';

import { revalidatePath } from 'next/cache';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { eventInquirySchema, inquiryUpdateSchema } from '@/lib/validation/event-inquiry';
import type { ActionResult } from '@/lib/actions/types';

function todayInVietnam() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export async function createEventInquiry(formData: FormData): Promise<ActionResult> {
  // A hidden field catches basic automated submissions without affecting visitors.
  if (formData.get('website')) return { success: true };
  const parsed = eventInquirySchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    event_type: formData.get('event_type'),
    event_date: formData.get('event_date'),
    guests: formData.get('guests'),
    budget: formData.get('budget') ?? '',
    message: formData.get('message') ?? '',
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  if (parsed.data.event_date < todayInVietnam()) {
    return { success: false, error: 'Vui lòng chọn ngày từ hôm nay trở đi.' };
  }

  const { error } = await createPublicSupabaseClient().from('event_inquiries').insert(parsed.data);
  if (error) {
    console.error('Could not save event inquiry', error.code);
    return { success: false, error: 'Chưa thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ qua điện thoại.' };
  }
  revalidatePath('/admin');
  revalidatePath('/admin/inquiries');
  return { success: true };
}

export async function updateEventInquiry(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;
  const parsed = inquiryUpdateSchema.safeParse({ status: formData.get('status'), staff_note: formData.get('staff_note') ?? '' });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { error } = await supabase.from('event_inquiries').update(parsed.data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  revalidatePath('/admin/inquiries');
  return { success: true };
}
