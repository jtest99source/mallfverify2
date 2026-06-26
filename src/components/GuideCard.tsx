import Link from "next/link";
import type { Guide } from "@/types/guide";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";

type CardEditorialImage = {
  imageUrl: string;
  alt?: string;
  attribution?: string;
} | null;

function formatGuideDate(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    const nloc = locale === "de" ? "de-DE" : locale === "en" ? "en-GB" : "es-ES";
    return date.toLocaleDateString(nloc, { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function GuideCard({ guide, locale, editorialImage }: { guide: Guide; locale: Locale; editorialImage?: CardEditorialImage }) {
  const imageUrl = guide.heroImageUrl || editorialImage?.imageUrl;
  const copy = t(locale).guides;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(10,10,10,0.07)] transition hover:shadow-[0_10px_32px_rgba(10,10,10,0.12)]">
      {imageUrl && (
        <div
          className="h-36 bg-sea"
          data-attribution={editorialImage?.attribution}
          data-image-alt={editorialImage?.alt}
          style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.06), rgba(10,10,10,0.42)), url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="border-l-2 border-[#FFCC00] pl-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A]">Guía · {formatGuideDate(guide.updatedAt, locale)}</p>
        <h2 className="mt-4 text-2xl font-bold leading-tight text-ink">{guide.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-olive">{guide.excerpt}</p>
        <Link href={`/${locale}/guides/${guide.slug}`} className="mt-auto inline-flex pt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-sea hover:text-[#0A0A0A]">{copy.readGuide}</Link>
      </div>
    </article>
  );
}
