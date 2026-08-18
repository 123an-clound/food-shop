import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-3xl text-burgundy">Không tìm thấy trang</h1>
      <p className="text-charcoal">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link
        href="/"
        className="rounded bg-burgundy px-6 py-2 text-sm font-medium text-ivory hover:bg-burgundy/90"
      >
        Về trang chủ
      </Link>
    </section>
  );
}
