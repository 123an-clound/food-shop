'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { createEventInquiry } from '@/app/actions/event-inquiries';
import { eventTypes } from '@/lib/events/content';

const BookingContext = createContext<(() => void) | null>(null);

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function useBooking() {
  const open = useContext(BookingContext);
  if (!open) throw new Error('useBooking must be used within BookingProvider');
  return open;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { locale } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const vi = locale === 'vi';

  function openBooking() {
    setStatus('idle');
    setError('');
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function closeBooking() {
    dialogRef.current?.close();
    setStatus('idle');
    setError('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get('event_date') ?? '') < localDate()) {
      setError(vi ? 'Vui lòng chọn ngày từ hôm nay trở đi.' : 'Please choose today or a later date.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const result = await createEventInquiry(data);
      if (!result.success) {
        setError(result.error);
        setStatus('idle');
        return;
      }
      form.reset();
      setStatus('success');
    } catch {
      setError(vi ? 'Chưa thể gửi yêu cầu. Vui lòng thử lại.' : 'Could not send your request. Please try again.');
      setStatus('idle');
    }
  }

  return (
    <BookingContext.Provider value={openBooking}>
      {children}
      <dialog
        ref={dialogRef}
        className="booking-dialog max-h-[92dvh] w-[min(100%-2rem,720px)] overflow-y-auto border-0 bg-[var(--brand-cream)] p-0 text-[var(--brand-ink)] shadow-2xl"
        aria-labelledby="booking-title"
        onClick={(event) => { if (event.target === dialogRef.current) closeBooking(); }}
        onClose={() => { setStatus('idle'); setError(''); }}
      >
        <div className="relative px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
          <button type="button" onClick={closeBooking} aria-label={vi ? 'Đóng biểu mẫu' : 'Close form'} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full hover:bg-[var(--brand-sand)]">
            <X size={22} aria-hidden="true" />
          </button>
          {status === 'success' ? (
            <div className="py-12 text-center" role="status">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--brand-ink)] text-white"><Check size={30} aria-hidden="true" /></span>
              <h2 id="booking-title" className="mt-7 font-heading text-3xl">{vi ? 'Yêu cầu đã được gửi' : 'Enquiry received'}</h2>
              <p className="mx-auto mt-3 max-w-md leading-7 text-[var(--brand-muted)]">{vi ? 'Thông tin của bạn đã được lưu. Chúng tôi sẽ liên hệ theo số điện thoại hoặc email bạn cung cấp.' : 'Your information has been saved. We will contact you using the phone or email you provided.'}</p>
              <button type="button" onClick={closeBooking} className="primary-green-button mt-7">{vi ? 'Đóng' : 'Close'}</button>
            </div>
          ) : (
            <>
              <p className="eyebrow pr-10 text-[var(--brand-accent)]">HƯƠNG VIỆT · {vi ? 'TƯ VẤN SỰ KIỆN' : 'EVENT ENQUIRY'}</p>
              <h2 id="booking-title" className="mt-3 font-heading text-3xl sm:text-4xl">{vi ? 'Kể chúng tôi nghe về ngày của bạn' : 'Tell us about your day'}</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--brand-muted)]">{vi ? 'Điền thông tin để bắt đầu trao đổi về không gian, thực đơn và phương án tổ chức phù hợp. Chưa có xác nhận đặt tiệc cho đến khi hai bên thống nhất.' : 'Share a few details to discuss the space, menu and event plan. A booking is only confirmed after we agree on the details.'}</p>
              <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="booking-field">{vi ? 'Họ và tên' : 'Full name'} *<input autoFocus name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder={vi ? 'Nguyễn Văn An' : 'Your name'} /></label>
                <label className="booking-field">{vi ? 'Số điện thoại' : 'Phone number'} *<input name="phone" type="tel" autoComplete="tel" required pattern="[0-9+().\s-]{9,18}" title={vi ? 'Nhập số điện thoại hợp lệ, 9–18 ký tự' : 'Enter a valid phone number, 9–18 characters'} placeholder="090 123 4567" /></label>
                <label className="booking-field">Email *<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="email@example.com" /></label>
                <label className="booking-field">{vi ? 'Loại sự kiện' : 'Event type'} *<select name="event_type" required defaultValue=""><option value="" disabled>{vi ? 'Chọn loại sự kiện' : 'Choose an event'}</option>{eventTypes.map((type) => <option key={type.value} value={type.value}>{vi ? type.vi : type.en}</option>)}</select></label>
                <label className="booking-field">{vi ? 'Ngày dự kiến' : 'Tentative date'} *<input name="event_date" type="date" min={localDate()} required /></label>
                <label className="booking-field">{vi ? 'Số lượng khách dự kiến' : 'Expected guests'} *<input name="guests" type="number" min="1" max="5000" required placeholder="150" /></label>
                <label className="booking-field sm:col-span-2">{vi ? 'Ngân sách dự kiến (không bắt buộc)' : 'Estimated budget (optional)'}<input name="budget" maxLength={120} placeholder={vi ? 'Ví dụ: 2–3 triệu đồng / bàn' : 'Your estimated budget'} /></label>
                <label className="booking-field sm:col-span-2">{vi ? 'Lời nhắn' : 'Message'}<textarea name="message" rows={3} maxLength={2000} placeholder={vi ? 'Phong cách, nhu cầu thực đơn, thời gian liên hệ thuận tiện…' : 'Style, menu preferences or a convenient contact time…'} /></label>
                <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                <p className="text-xs leading-6 text-[var(--brand-muted)] sm:col-span-2">{vi ? 'Thông tin bạn gửi chỉ được dùng để liên hệ tư vấn cho yêu cầu này.' : 'Your details are used to follow up on this enquiry.'}</p>
                {error && <p role="alert" className="text-sm text-red-800 sm:col-span-2">{error}</p>}
                <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="primary-green-button disabled:cursor-wait disabled:opacity-65 sm:col-span-2">
                  {status === 'sending' ? (vi ? 'Đang gửi yêu cầu…' : 'Sending…') : (vi ? 'Gửi yêu cầu tư vấn' : 'Send enquiry')}
                </button>
              </form>
            </>
          )}
        </div>
      </dialog>
    </BookingContext.Provider>
  );
}
