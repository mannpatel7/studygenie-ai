export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}
