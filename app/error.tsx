'use client';

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-3xl text-burgundy">Đã có lỗi xảy ra</h1>
      <p className="text-charcoal">
        Rất tiếc, trang này hiện không tải được. Vui lòng thử lại sau ít phút.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-burgundy px-6 py-2 text-sm font-medium text-ivory hover:bg-burgundy/90"
      >
        Thử lại
      </button>
    </section>
  );
}
