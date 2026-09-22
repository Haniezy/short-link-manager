import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main aria-busy="true" className="mx-auto max-w-5xl space-y-8 px-6 py-24">
    <Skeleton className="mx-auto h-12 w-3/4" />
    <Skeleton className="mx-auto h-6 w-1/2" />
    <Skeleton className="mx-auto h-36 max-w-3xl" />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20" />)}</div>
    <Skeleton className="h-64" />
  </main>;
}
