import Link from "next/link";
import { GuideCard } from "@/components/GuideCard";
import { getBusinessImagesMap, getGuides } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";
import { getEditorialImage, getPrimaryEditorialKeyForGuide, EDITORIAL_CATEGORY_POOL } from "@/lib/unsplash";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = t(safeLocale).guides;
  return generateSeoMetadata({
    title: `${copy.title} | Mallorca Verified`,
    description: copy.description,
    path: `/${safeLocale}/guides`,
    locale: safeLocale,
    alternateLocales: ["es", "en"]
  });
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = t(safeLocale).guides;
  const guides = await getGuides(safeLocale);

  // Batch-fetch business images for all guides in one query
  const allBusinessIds = [...new Set(guides.flatMap((g) => g.sections.flatMap((s) => s.business_ids ?? [])))];
  const businessImagesMap = await getBusinessImagesMap(allBusinessIds);

  // Preload all editorial category images in one shot (avoids per-guide DB calls)
  const editorialImagesRaw = await Promise.all(EDITORIAL_CATEGORY_POOL.map(k => getEditorialImage(k)));
  const editorialPool = EDITORIAL_CATEGORY_POOL
    .map((key, i) => ({ key, url: editorialImagesRaw[i]?.imageUrl ?? null }))
    .filter((e): e is { key: string; url: string } => e.url !== null);

  // Assign a unique cover URL to each guide — sequential, fully deduplicated.
  const seenUrls = new Set<string>();
  const coverUrls: (string | null)[] = [];

  for (const guide of guides) {
    // 1. Guide-specific hero or real business photo (http only — skip placeholders)
    const candidates: string[] = [];
    if (guide.heroImageUrl) candidates.push(guide.heroImageUrl);
    for (const section of guide.sections) {
      for (const id of section.business_ids ?? []) {
        const url = businessImagesMap.get(id);
        if (url && url.startsWith("http")) candidates.push(url);
      }
    }

    let chosen: string | null = null;
    for (const url of candidates) {
      if (!seenUrls.has(url)) { seenUrls.add(url); chosen = url; break; }
    }

    // 2. No real photo — rotate through editorial pool, primary key first
    if (!chosen) {
      const primaryKey = getPrimaryEditorialKeyForGuide(guide.title);
      const ordered = [
        ...editorialPool.filter(e => e.key === primaryKey),
        ...editorialPool.filter(e => e.key !== primaryKey),
      ];
      for (const { url } of ordered) {
        if (!seenUrls.has(url)) { seenUrls.add(url); chosen = url; break; }
      }
    }

    coverUrls.push(chosen);
  }

  return (
    <main className="bg-[#07101F]">
      <section className="px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{copy.eyebrow}</p>
            <h1 className="font-display mt-3 text-4xl font-black leading-[1.02] text-white sm:text-6xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">{copy.description}</p>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link href={`/${safeLocale}/top/restaurants`} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
              {copy.viewRankings}
            </Link>
            <Link href={`/${safeLocale}`} className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/20 px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 hover:border-white/40 hover:text-white">
              {copy.goHome}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {guides.length > 0 ? (
          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, index) => <GuideCard key={guide.id} guide={guide} locale={safeLocale} coverImageUrl={coverUrls[index]} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.10] bg-white/[0.04] p-5 text-sm leading-7 text-white/50">
            {copy.empty}
          </div>
        )}
      </section>
    </main>
  );
}
