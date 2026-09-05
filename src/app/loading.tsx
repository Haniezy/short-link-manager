import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-24" />
            </div>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-10 w-36" />
                </div>

                <Skeleton className="h-72 w-full rounded-xl" />
            </section>
        </main>
    );
}