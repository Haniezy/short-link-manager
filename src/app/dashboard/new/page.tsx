import { requireSession } from "@/lib/auth/guard";
import { LinkForm } from "@/components/link-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewLinkPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New short link</h1>
        <p className="text-sm text-muted-foreground">
          Paste a long URL and we&apos;ll give you a short one.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link details</CardTitle>
          <CardDescription>
            Only the destination URL is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm />
        </CardContent>
      </Card>
    </div>
  );
}
