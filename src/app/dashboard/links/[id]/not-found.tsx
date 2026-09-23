import Link from "next/link";
import { readLocale } from "@/lib/locale-server";
export default async function NotFound() { const fa = await readLocale() === "fa"; return <main className="dashboard-main dashboard-empty"><h1>{fa ? "این لینک پیدا نشد." : "Link not found."}</h1><p>{fa ? "ممکن است حذف شده باشد یا متعلق به حساب شما نباشد." : "It may have been deleted or belong to another account."}</p><Link href="/dashboard">{fa ? "بازگشت به داشبورد" : "Back to dashboard"}</Link></main>; }
