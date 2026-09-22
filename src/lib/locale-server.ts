import "server-only";
import { cookies } from "next/headers";
import { localeFrom } from "./locale";
export async function readLocale() { return localeFrom((await cookies()).get("linkflow-locale")?.value); }
