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
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-[0_6px_22px_rgba(10,10,10,0.06)] transition hover:-translate-y-0.5 hover:border-[#07101F] hover:shadow-[0_14px_34px_rgba(10,10,10,0.11)]">
      {imageUrl && (
        <div
          className="h-40 bg-[#F3F4F6] sm:h-44"
          data-attribution={editorialImage?.attribution}
          data-image-alt={editorialImage?.alt}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0), rgba(10,10,10,0.10)), url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="border-l-2 border-[#00C37A] pl-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#0A0A0A]">
          Guia · {formatGuideDate(guide.updatedAt, locale)}
        </p>
        <h2 className="mt-4 text-[22px] font-black leading-[1.05] text-ink sm:text-2xl">{guide.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-olive">{guide.excerpt}</p>
        <Link href={`/${locale}/guides/${guide.slug}`} className="mt-auto inline-flex pt-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:opacity-60">
          {copy.readGuide}
        </Link>
      </div>
    </article>
  );
}
