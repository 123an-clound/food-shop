'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, CalendarDays, Users, Phone, Mail, Download } from 'lucide-react';
import { updateEventInquiry } from '@/app/actions/event-inquiries';
import type { EventInquiry } from '@/lib/events/content';
import { eventInquiryStatuses } from '@/lib/validation/event-inquiry';

const statusLabels: Record<EventInquiry['status'], string> = {
  new: 'Mới', contacted: 'Đã liên hệ', quoted: 'Đã báo giá', confirmed: 'Đã xác nhận', closed: 'Đã đóng',
};
const typeLabels: Record<EventInquiry['event_type'], string> = {
  wedding: 'Tiệc cưới', corporate: 'Doanh nghiệp', private: 'Tiệc riêng', other: 'Khác',
};

export function InquiryManager({ inquiries }: { inquiries: EventInquiry[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const visible = useMemo(() => inquiries.filter((item) => {
    if (filter !== 'all' && item.status !== filter) return false;
    const term = search.trim().toLocaleLowerCase('vi');
    return !term || `${item.name} ${item.phone} ${item.email} ${typeLabels[item.event_type]}`.toLocaleLowerCase('vi').includes(term);
  }), [inquiries, search, filter]);

  async function save(id: string, formData: FormData) {
    setPendingId(id);
    try {
      const result = await updateEventInquiry(id, formData);
      if (!result.success) { toast.error(result.error); return; }
      toast.success('Đã cập nhật yêu cầu.');
      router.refresh();
    } catch { toast.error('Không thể lưu. Vui lòng thử lại.'); }
    finally { setPendingId(null); }
  }

  function downloadCsv() {
    const columns = ['Ngày gửi', 'Họ tên', 'Điện thoại', 'Email', 'Sự kiện', 'Ngày tổ chức', 'Số khách', 'Ngân sách', 'Trạng thái', 'Lời nhắn', 'Ghi chú nội bộ'];
    const safeCell = (value: string | number) => {
      let text = String(value).replace(/\r?\n/g, ' ');
      if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = visible.map((item) => [item.created_at, item.name, item.phone, item.email, typeLabels[item.event_type], item.event_date, item.guests, item.budget, statusLabels[item.status], item.message, item.staff_note]);
    const csv = '\uFEFF' + [columns, ...rows].map((row) => row.map(safeCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `huong-viet-yeu-cau-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="space-y-5">
    <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_200px_auto_auto] sm:items-center">
      <label className="relative"><span className="sr-only">Tìm yêu cầu</span><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, điện thoại, email…" className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm" /></label>
      <label><span className="sr-only">Lọc trạng thái</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 w-full rounded-md border bg-background px-3 text-sm"><option value="all">Tất cả trạng thái</option>{eventInquiryStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
      <p className="text-sm text-muted-foreground">{visible.length} / {inquiries.length} yêu cầu</p>
      <button type="button" onClick={downloadCsv} disabled={visible.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold disabled:opacity-50"><Download size={16} aria-hidden="true" />Xuất CSV</button>
    </div>
    {visible.length === 0 ? <div className="rounded-lg border bg-card px-6 py-12 text-center text-muted-foreground">Chưa có yêu cầu phù hợp.</div> :
      <div className="grid gap-4">{visible.map((item) => <article key={item.id} className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-heading text-2xl">{item.name}</h2><span className="rounded-full bg-[var(--brand-sand)] px-3 py-1 text-xs font-semibold text-[var(--brand-ink)]">{statusLabels[item.status]}</span></div><p className="mt-1 text-sm text-muted-foreground">{typeLabels[item.event_type]} · Gửi {new Date(item.created_at).toLocaleString('vi-VN')}</p></div><div className="flex flex-wrap gap-3 text-sm"><a className="inline-flex items-center gap-1 underline-offset-4 hover:underline" href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}><Phone size={16} aria-hidden="true" />{item.phone}</a><a className="inline-flex items-center gap-1 underline-offset-4 hover:underline" href={`mailto:${item.email}`}><Mail size={16} aria-hidden="true" />{item.email}</a></div></div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-y py-4 text-sm"><span className="inline-flex items-center gap-2"><CalendarDays size={17} aria-hidden="true" />{new Date(`${item.event_date}T12:00:00`).toLocaleDateString('vi-VN')}</span><span className="inline-flex items-center gap-2"><Users size={17} aria-hidden="true" />{item.guests.toLocaleString('vi-VN')} khách</span>{item.budget && <span>Ngân sách: {item.budget}</span>}</div>
        {item.message && <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{item.message}</p>}
        <form action={(formData) => save(item.id, formData)} className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-[190px_1fr_auto] sm:items-end">
          <label className="grid gap-2 text-sm font-medium">Trạng thái<select name="status" defaultValue={item.status} className="h-11 rounded-md border bg-background px-3 font-normal">{eventInquiryStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-medium">Ghi chú nội bộ<textarea name="staff_note" defaultValue={item.staff_note} maxLength={2000} rows={2} className="min-h-11 rounded-md border bg-background px-3 py-2 font-normal" placeholder="Lịch gọi lại, nhu cầu khách…" /></label>
          <button type="submit" disabled={pendingId === item.id} className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{pendingId === item.id ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
        </form>
      </article>)}</div>}
  </div>;
}
