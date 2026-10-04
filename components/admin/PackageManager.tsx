'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { deleteEventPackage, saveEventPackage } from '@/app/actions/event-packages';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { EventPackage } from '@/lib/events/content';
import { formatPrice } from '@/lib/format';

const suggestions = ['/images/wedding-hero.png', '/images/wedding-ceremony.png', '/images/event-gala.png', '/images/table-setting.jpg'];

export function PackageManager({ packages }: { packages: EventPackage[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<EventPackage | null | 'new'>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<EventPackage | null>(null);

  function edit(item: EventPackage | 'new') {
    setEditing(item);
    setImageUrl(item === 'new' ? suggestions[0] : item.image_url);
  }

  async function save(formData: FormData) {
    setPending(true);
    try {
      const result = await saveEventPackage(editing === 'new' ? null : editing?.id ?? null, formData);
      if (!result.success) { toast.error(result.error); return; }
      toast.success('Đã lưu gói tiệc.');
      setEditing(null);
      router.refresh();
    } catch { toast.error('Không thể lưu gói tiệc.'); }
    finally { setPending(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const result = await deleteEventPackage(deleting.id);
    setDeleting(null);
    if (!result.success) { toast.error(result.error); return; }
    toast.success('Đã xoá gói tiệc.');
    router.refresh();
  }

  const item = editing === 'new' ? null : editing;
  return <div className="space-y-6">
    <button type="button" onClick={() => edit('new')} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"><Plus size={17} aria-hidden="true" />Thêm gói tiệc</button>
    {editing && <form key={item?.id ?? 'new'} action={save} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-7">
      <div className="sm:col-span-2"><h2 className="font-heading text-2xl">{item ? `Sửa ${item.name_vi}` : 'Gói tiệc mới'}</h2><p className="mt-1 text-sm text-muted-foreground">Có thể giữ gói ở chế độ ẩn trong khi chuẩn bị nội dung.</p></div>
      <label className="grid gap-2 text-sm font-medium">Tên tiếng Việt *<input name="name_vi" required minLength={2} maxLength={120} defaultValue={item?.name_vi ?? ''} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Tên tiếng Anh<input name="name_en" maxLength={120} defaultValue={item?.name_en ?? ''} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Mô tả tiếng Việt<textarea name="description_vi" rows={4} maxLength={2000} defaultValue={item?.description_vi ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Mô tả tiếng Anh<textarea name="description_en" rows={4} maxLength={2000} defaultValue={item?.description_en ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Hạng mục tiếng Việt (mỗi dòng một mục)<textarea name="inclusions_vi" rows={5} defaultValue={item?.inclusions_vi.join('\n') ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Hạng mục tiếng Anh (mỗi dòng một mục)<textarea name="inclusions_en" rows={5} defaultValue={item?.inclusions_en.join('\n') ?? ''} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Giá khởi điểm (VND, để trống nếu báo giá riêng)<input name="starting_price" type="number" min="0" max="999999999999" defaultValue={item?.starting_price ?? ''} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Thứ tự hiển thị<input name="display_order" type="number" min="0" max="9999" defaultValue={item?.display_order ?? packages.length + 1} className="h-11 rounded-md border bg-background px-3 font-normal" /></label>
      <div className="space-y-3 sm:col-span-2"><label className="grid gap-2 text-sm font-medium">Đường dẫn ảnh<input name="image_url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/images/wedding-hero.png hoặc URL HTTPS" className="h-11 rounded-md border bg-background px-3 font-normal" /></label><div className="flex flex-wrap gap-2">{suggestions.map((url) => <button key={url} type="button" onClick={() => setImageUrl(url)} className="rounded-md border px-3 py-2 text-xs hover:bg-muted">{url.split('/').pop()}</button>)}</div><ImageUploader bucket="site-media" label="Tải ảnh gói tiệc" existingUrl={imageUrl || undefined} onUploaded={setImageUrl} /></div>
      <label className="flex items-center gap-3 text-sm font-medium"><input name="is_featured" type="checkbox" defaultChecked={item?.is_featured ?? false} className="size-4 accent-[#986f3c]" />Gói nổi bật</label>
      <label className="flex items-center gap-3 text-sm font-medium"><input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? false} className="size-4 accent-[#986f3c]" />Hiển thị công khai</label>
      <div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" disabled={pending} className="min-h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60">{pending ? 'Đang lưu…' : 'Lưu gói tiệc'}</button><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-md border px-6 text-sm font-semibold">Huỷ</button></div>
    </form>}
    {packages.length === 0 ? <div className="rounded-lg border bg-card px-6 py-12 text-center text-muted-foreground">Chưa có gói tiệc trong hệ thống. Trang công khai đang dùng gợi ý mẫu.</div> : <div className="grid gap-4 xl:grid-cols-2">{packages.map((pkg) => <article key={pkg.id} className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm sm:flex-row"><div className="relative aspect-[16/9] shrink-0 sm:aspect-auto sm:w-44"><Image src={pkg.image_url || suggestions[0]} alt="" fill sizes="176px" className="object-cover" /></div><div className="flex flex-1 flex-col p-5"><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-xl">{pkg.name_vi}</h2><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${pkg.is_active ? 'bg-green-100 text-green-900' : 'bg-muted text-muted-foreground'}`}>{pkg.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</span></div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pkg.description_vi}</p><p className="mt-3 text-sm font-semibold">{pkg.starting_price ? formatPrice(pkg.starting_price) : 'Báo giá riêng'}</p><div className="mt-auto flex gap-2 pt-4"><button type="button" onClick={() => edit(pkg)} className="inline-flex min-h-10 items-center gap-1 rounded-md border px-3 text-sm"><Pencil size={15} aria-hidden="true" />Sửa</button><button type="button" onClick={() => setDeleting(pkg)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-red-200 px-3 text-sm text-red-800"><Trash2 size={15} aria-hidden="true" />Xoá</button></div></div></article>)}</div>}
    <ConfirmDeleteDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)} onConfirm={confirmDelete} itemName={deleting?.name_vi ?? ''} />
  </div>;
}
