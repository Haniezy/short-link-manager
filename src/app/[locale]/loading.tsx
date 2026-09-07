export default function Loading() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-9 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}
