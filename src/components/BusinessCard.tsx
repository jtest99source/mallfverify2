import Link from "next/link";
import { IconArrowUpRight, IconDiamond, IconMapPin } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import { categoryConfigs, getCategorySlugFromBusiness } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { RatingBadge } from "@/components/RatingBadge";
import { BusinessImage } from "@/components/BusinessImage";
import { isUntapped } from "@/lib/untapped-score";

function descriptionFor(business: Business) {
  const text = business.editorialDescription || business.aiDescription || business.shortDescription || business.description;
  if (text && !/Google Places|importado desde Google|propuesta pensada para visitantes|perfil encaja|revisión editorial/i.test(text)) return text;
  return "Datos, valoración y reseñas verificadas para comparar antes de decidir.";
}

function priceBadge(business: Business) {
  const estimate = business.priceEstimate;
  if (!estimate) return null;

  const min = estimate.amount_min ?? estimate.range_min ?? estimate.per_person_min ?? null;
  const max = estimate.amount_max ?? estimate.range_max ?? estimate.per_person_max ?? null;
  const currency = estimate.currency === "EUR" || !estimate.currency ? "€" : estimate.currency;

  if (typeof min === "number" && typeof max === "number") return min === max ? `${min} ${currency}` : `${min}-${max} ${currency}`;
  if (typeof min === "number") return `Desde ${min} ${currency}`;
  if (typeof max === "number") return `Hasta ${max} ${currency}`;

  const label = estimate.label?.trim();
  if (label && !/persona|person|por/i.test(label)) return label;
  return null;
}

function usefulBadges(business: Business) {
  return [business.city || business.area || business.municipality, priceBadge(business)].filter((item): item is string => Boolean(item?.trim())).slice(0, 2);
}

export function BusinessCard({ business, locale }: { business: Business; locale: Locale }) {
  const categorySlug = getCategorySlugFromBusiness(business.category);
  const categoryLabel = categoryConfigs[categorySlug].singular;
  const publicName = getBusinessPublicName(business);
  const badges = usefulBadges(business);

  return (
    <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded-lg border border-borderline bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#C4933F] hover:shadow-md">
      <Link href={`/${locale}/${categorySlug}/${business.slug}`} className="flex flex-1 flex-col">
        <BusinessImage business={business} category={business.category} variant="card" className="aspect-[4/3] min-h-0 shrink-0">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                <IconMapPin size={12} stroke={2} />
                {business.area || business.city || "Mallorca"}
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-all duration-150 group-hover:bg-[#0E8F72]">
                <IconArrowUpRight size={15} stroke={2} />
              </span>
            </div>
            <h2 className="line-clamp-2 text-2xl font-black leading-tight text-white drop-shadow-sm">{publicName}</h2>
          </div>
        </BusinessImage>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sea">{categoryLabel}</p>
            <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} compact />
          </div>

          {isUntapped(business.untappedScore) && (
            <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#92400E]">
              <IconDiamond size={12} stroke={2} />
              Joya oculta
            </div>
          )}

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-olive">{descriptionFor(business)}</p>

          <div className="mt-auto pt-5">
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-[#E7DED0] bg-[#FFF8EC] px-2.5 py-1 text-[10px] font-semibold text-olive">
                  {badge}
                </span>
              ))}
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#B86B1D] transition-all duration-150 group-hover:text-[#0E8F72]">
              Ver datos y reseñas
              <IconArrowUpRight size={14} stroke={2} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
