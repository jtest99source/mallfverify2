import Link from "next/link";
import type { Ranking } from "@/types/ranking";
import type { Locale } from "@/lib/i18n";

type CardEditorialImage = {
  imageUrl: string;
  alt?: string;
  attribution?: string;
} | null;

export function RankingCard({ ranking, locale, index, editorialImage }: { ranking: Ranking; locale: Locale; index?: number; editorialImage?: CardEditorialImage }) {
  const imageUrl = ranking.heroImageUrl || editorialImage?.imageUrl;

  return (
    <article className="border border-borderline bg-paper p-5 transition hover:bg-linen">
      <Link href={`/${locale}/rankings/${ranking.slug}`} className="grid grid-cols-[3rem_1fr] gap-4">
        <div className="text-4xl font-black leading-none text-borderline">{String((index ?? 0) + 1).padStart(2, "0")}</div>
        <div>
          {imageUrl && (
            <div
              className="mb-4 h-20 border border-borderline bg-sea"
              data-attribution={editorialImage?.attribution}
              data-image-alt={editorialImage?.alt}
              style={{ backgroundImage: `linear-gradient(180deg, rgba(28,28,24,0.1), rgba(28,28,24,0.38)), url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
          )}
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sea">{ranking.category} · {ranking.items.length} sitios</p>
          <h2 className="mt-1 text-xl font-bold leading-tight">{ranking.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-olive">{ranking.hook}</p>
        </div>
      </Link>
    </article>
  );
}
