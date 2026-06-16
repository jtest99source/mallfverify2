import Link from "next/link";
import type { Guide } from "@/types/guide";
import type { Locale } from "@/lib/i18n";

type CardEditorialImage = {
  imageUrl: string;
  alt?: string;
  attribution?: string;
} | null;

export function GuideCard({ guide, locale, editorialImage }: { guide: Guide; locale: Locale; editorialImage?: CardEditorialImage }) {
  const imageUrl = guide.heroImageUrl || editorialImage?.imageUrl;

  return (
    <article className="flex h-full flex-col border border-borderline bg-white p-6 transition hover:bg-paper">
      {imageUrl && (
        <div
          className="-mx-6 -mt-6 mb-5 h-32 bg-sea"
          data-attribution={editorialImage?.attribution}
          data-image-alt={editorialImage?.alt}
          style={{ backgroundImage: `linear-gradient(180deg, rgba(27,46,75,0.06), rgba(27,46,75,0.42)), url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <p className="border-l-2 border-[#FFD166] pl-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">Guía · {guide.updatedAt}</p>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-ink">{guide.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-olive">{guide.excerpt}</p>
      <Link href={`/${locale}/guides/${guide.slug}`} className="mt-auto inline-flex pt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-sea hover:text-[#0E8F72]">Leer guía</Link>
    </article>
  );
}
