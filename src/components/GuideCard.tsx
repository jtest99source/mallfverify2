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
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-white/[0.10] bg-[#0C1A2E] shadow-[0_6px_22px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-white/25">
      <div
        className="h-40 bg-[#040D1A] sm:h-44"
        data-attribution={editorialImage?.attribution}
        data-image-alt={editorialImage?.alt}
        style={imageUrl ? {
          backgroundImage: `linear-gradient(180deg, rgba(4,13,26,0), rgba(4,13,26,0.30)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        } : undefined}
      />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A] before:h-px before:w-3 before:bg-[#00C37A]">
          {locale === "de" ? "Guía" : locale === "en" ? "Guide" : "Guía"} · {formatGuideDate(guide.updatedAt, locale)}
        </p>
        <h2 className="mt-4 font-display text-[22px] font-black leading-[1.05] text-white sm:text-2xl">{guide.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">{guide.excerpt}</p>
        <Link href={`/${locale}/guides/${guide.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#00C37A] hover:text-white">
          {copy.readGuide} →
        </Link>
      </div>
    </article>
  );
}
