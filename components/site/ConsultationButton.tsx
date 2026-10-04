'use client';

import { ArrowRight } from 'lucide-react';
import { useBooking } from './BookingDialog';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ConsultationButton({ className = 'primary-green-button' }: { className?: string }) {
  const openBooking = useBooking();
  const { locale } = useLanguage();
  return <button type="button" onClick={openBooking} className={className}>{locale === 'vi' ? 'Nhận tư vấn tiệc' : 'Plan your event'} <ArrowRight size={18} aria-hidden="true" /></button>;
}
