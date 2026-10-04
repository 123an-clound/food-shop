'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteTestimonial, saveTestimonial } from '@/app/actions/testimonials';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { Testimonial } from '@/lib/events/content';

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [pending, setPending] = useState(false);

  async function save(formData: FormData) {
    setPending(true);
    try {
      const result = await saveTestimonial(editing === 'new' ? null : editing?.id ?? null, formData);
      if (!result.success) { toast.error(result.error); return; }
      toast.success('Đã lưu đánh giá.');
      setEditing(null);
      router.refresh();
    } catch { toast.error('Không thể lưu đánh giá. Vui lòng thử lại.'); }
    finally { setPending(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setPending(true);
    try {
      const result = await deleteTestimonial(deleting.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success('Đã xoá đánh giá.');
      setDeleting(null);
      router.refresh();
    } catch { toast.error('Không thể xoá đánh giá. Vui lòng thử lại.'); }
    finally { setPending(false); }
  }

  const item = editing === 'new' ? null : editing;
  return <div className="space-y-6">
    <button type="button" onClick={() => setEditing('new')} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"><Plus size={17} aria-hidden="true" />Thêm đánh giá</button>
    {editing && <form key={item?.id ?? 'new'} action={save} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-7">
      <div className="sm:col-span-2"><h2 className="font-heading text-2xl">{item ? `Sửa đánh giá của ${item.customer_name}` : 'Đánh giá mới'}</h2><p className="mt-1 text-sm text-muted-foreground">Chỉ đăng nội dung đã được khách hàng đồng ý chia sẻ. Để ở chế độ ẩn trong khi biên tập.</p></div>
      <label className="grid gap-2 text-sm font-medium">Tên khách hàng *<input name="customer_name" required minLength={2} maxLength={120} defaultValue={item?.customer_name ?? ''} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Dịp tiệc / mô tả ngắn<input name="event_label" maxLength={120} defaultValue={item?.event_label ?? ''} placeholder="Tiệc cưới tháng 10" className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">Lời nhận xét tiếng Việt *<textarea name="quote_vi" required minLength={20} maxLength={1200} rows={4} defaultValue={item?.quote_vi ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">Bản dịch tiếng Anh<textarea name="quote_en" maxLength={1200} rows={4} defaultValue={item?.quote_en ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Đánh giá<select name="rating" defaultValue={item?.rating ?? 5} className="h-11 rounded-md border bg-background px-3 font-normal">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5 sao</option>)}</select></label>
      <label className="grid gap-2 text-sm font-medium">Thứ tự hiển thị<input name="display_order" type="number" min="0" max="9999" defaultValue={item?.display_order ?? testimonials.length + 1} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2"><input name="is_published" type="checkbox" defaultChecked={item?.is_published ?? false} className="size-4 accent-[#76542f]" />Hiển thị công khai</label>
      <div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" disabled={pending} className="min-h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60">{pending ? 'Đang lưu…' : 'Lưu đánh giá'}</button><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-md border px-6 text-sm font-semibold">Huỷ</button></div>
    </form>}
    {testimonials.length === 0 ? <div className="rounded-lg border bg-card px-6 py-12 text-center text-muted-foreground">Chưa có đánh giá khách hàng. Mục đánh giá sẽ xuất hiện trên trang chủ sau khi có nội dung được đăng.</div> : <div className="grid gap-4 lg:grid-cols-2">{testimonials.map((review) => <article key={review.id} className="rounded-lg border bg-card p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-heading text-xl">{review.customer_name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.is_published ? 'bg-green-100 text-green-900' : 'bg-muted text-muted-foreground'}`}>{review.is_published ? 'Đang hiển thị' : 'Đang ẩn'}</span></div><p className="mt-2 text-sm text-muted-foreground">{review.event_label || 'Chưa có mô tả dịp tiệc'} · {review.rating}/5 sao</p><blockquote className="mt-4 line-clamp-4 leading-7">“{review.quote_vi}”</blockquote><div className="mt-5 flex gap-2 border-t pt-4"><button type="button" onClick={() => setEditing(review)} className="inline-flex min-h-10 items-center gap-1 rounded-md border px-3 text-sm"><Pencil size={15} aria-hidden="true" />Sửa</button><button type="button" onClick={() => setDeleting(review)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-red-200 px-3 text-sm text-red-800"><Trash2 size={15} aria-hidden="true" />Xoá</button></div></article>)}</div>}
    <ConfirmDeleteDialog open={deleting !== null} onOpenChange={(open) => !open && !pending && setDeleting(null)} onConfirm={confirmDelete} itemName={deleting?.customer_name ?? ''} />
  </div>;
}
