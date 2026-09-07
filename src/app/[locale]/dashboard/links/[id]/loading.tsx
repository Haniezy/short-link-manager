import { Skeleton } from "@/components/ui/skeleton";

export default function LinkDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-40" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl sm:col-span-2" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
