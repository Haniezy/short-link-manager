import { readAvatar } from "@/lib/db/avatars";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const image = await readAvatar((await params).id);
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 503 }); }
}
