'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-xl font-display text-cream mb-4">데이터베이스를 불러오는 중 오류가 발생했습니다</h2>
      <p className="text-cream-muted mb-6">{error.message}</p>
      <button onClick={reset} className="btn btn-primary">
        다시 시도
      </button>
    </div>
  );
}
