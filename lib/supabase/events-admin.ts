import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventInquiry } from '@/lib/events/content';

export async function getEventInquiries(supabase: SupabaseClient): Promise<EventInquiry[]> {
  const { data, error } = await supabase.from('event_inquiries').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []) as EventInquiry[];
}

export async function getEventDashboardStats(supabase: SupabaseClient) {
  const [newInquiries, totalInquiries, activePackages, publishedTestimonials] = await Promise.all([
    supabase.from('event_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('event_inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('event_packages').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ]);
  for (const result of [newInquiries, totalInquiries, activePackages, publishedTestimonials]) if (result.error) throw result.error;
  return {
    newInquiries: newInquiries.count ?? 0,
    totalInquiries: totalInquiries.count ?? 0,
    activePackages: activePackages.count ?? 0,
    publishedTestimonials: publishedTestimonials.count ?? 0,
  };
}
