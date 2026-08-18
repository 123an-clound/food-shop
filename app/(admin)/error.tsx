'use client';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Đã có lỗi xảy ra</h2>
      <p className="text-sm text-muted-foreground">
        Vui lòng thử lại. Nếu lỗi tiếp tục, liên hệ người quản trị hệ thống.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Thử lại
      </button>
    </div>
  );
}
