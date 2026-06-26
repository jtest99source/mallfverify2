import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function RankingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  redirect(`/${safeLocale}/top/restaurants`);
}
