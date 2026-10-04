import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-[var(--brand-cream)] text-[var(--brand-ink)] lg:grid-cols-2">
      <div className="relative hidden min-h-screen overflow-hidden bg-[#29231e] lg:block"><Image src="/images/wedding-hero.png" alt="" fill sizes="50vw" className="object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-[#1b1510]/90 via-transparent to-[#1b1510]/20" /><div className="absolute bottom-12 left-12 right-12 text-white"><p className="text-xs font-semibold uppercase tracking-[.26em] text-[#e9d0a9]">Hương Việt · Wedding & Events</p><p className="mt-5 max-w-xl font-heading text-4xl leading-tight">Chăm chút từng khoảnh khắc, bắt đầu từ cách chúng ta quản lý.</p></div></div>
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16"><Link href="/" className="font-heading text-2xl">HƯƠNG VIỆT <span className="block font-body text-[9px] font-bold uppercase tracking-[.28em] text-[var(--brand-accent)]">Wedding & Events</span></Link><div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16"><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">KHU VỰC QUẢN TRỊ</p><h1 className="mt-4 font-heading text-4xl">Đăng nhập</h1><p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">Tiếp tục quản lý yêu cầu tư vấn, gói tiệc và nội dung website.</p><div className="mt-9"><Suspense><LoginForm /></Suspense></div></div><p className="text-xs text-[var(--brand-muted)]">Chỉ dành cho tài khoản quản trị được cấp quyền.</p></div>
    </main>
  );
}
