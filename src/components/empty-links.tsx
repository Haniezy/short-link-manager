import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyLinks() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/25 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_4px_16px_-4px_oklch(0.575_0.205_294/0.45)]">
        <Link2 className="h-6 w-6" strokeWidth={2.25} />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">No links yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first short link to start sharing and tracking clicks.
        </p>
      </div>
      <Link href="/dashboard/new">
        <Button>Create a link</Button>
      </Link>
    </div>
  );
}
