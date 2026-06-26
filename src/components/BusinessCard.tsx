import Link from "next/link";
import { IconArrowUpRight, IconDiamond, IconMapPin, IconRoad } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import { getCategorySlugFromBusiness } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { categoryLabelForBusiness, t } from "@/lib/i18n-copy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { RatingBadge } from "@/components/RatingBadge";
import { BusinessImage } from "@/components/BusinessImage";
import { isUntapped } from "@/lib/untapped-score";

const placeholderDescriptionPattern = /Google Places|datos de Google|importad[oa] desde Google|pendiente de revisi|propuesta pensada para visitantes|perfil encaja|revision editorial|revisión editorial/i;

function realDescriptionFor(business: Business) {
  const text = business.editorialDescription || business.aiDescription || business.shortDescription || business.description;
  if (!text || placeholderDescriptionPattern.test(text)) return null;
  return text;
}

function locationFor(business: Business) {
  return business.city || business.area || business.municipality || "Mallorca";
}

function compactAddress(address?: string) {
  if (!address) return null;
  return address
    .replace(/\s*,?\s*(Illes Balears|Islas Baleares|Balearic Islands|Spain|España)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCurrencyAmount(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, "");
}

function orientativeRangeFromExactPrice(value: number) {
  const midpoint = Math.max(5, Math.round(value / 5) * 5);
  const spread = midpoint <= 30 ? 5 : midpoint <= 80 ? 10 : 20;
  return {
    min: Math.max(0, midpoint - spread),
    max: midpoint + spread
  };
}

function formatOrientativePrice(min: number, max: number, currency: string) {
  return `${formatCurrencyAmount(min)}-${formatCurrencyAmount(max)} ${currency}`;
}

function orientativeRangeFromPriceLabel(label: string) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*(€|EUR)?/i);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;
  const range = orientativeRangeFromExactPrice(value);
  return formatOrientativePrice(range.min, range.max, match[2] ?? "€");
}

function priceBadge(business: Business, locale: Locale) {
  const estimate = business.priceEstimate;
  if (!estimate) return null;

  const min = estimate.amount_min ?? estimate.range_min ?? estimate.per_person_min ?? null;
  const max = estimate.amount_max ?? estimate.range_max ?? estimate.per_person_max ?? null;
  const currency = estimate.currency === "EUR" || !estimate.currency ? "€" : estimate.currency;
  const from = locale === "de" ? "Ab" : locale === "en" ? "From" : "Desde";
  const until = locale === "de" ? "Bis" : locale === "en" ? "Up to" : "Hasta";

  if (typeof min === "number" && typeof max === "number") {
    if (min === max) {
      const range = orientativeRangeFromExactPrice(min);
      return formatOrientativePrice(range.min, range.max, currency);
    }
    return formatOrientativePrice(min, max, currency);
  }
  if (typeof min === "number") return `${from} ${formatCurrencyAmount(Math.round(min / 5) * 5)} ${currency}`;
  if (typeof max === "number") return `${until} ${formatCurrencyAmount(Math.round(max / 5) * 5)} ${currency}`;

  const label = estimate.label?.trim();
  if (label && !/persona|person|por/i.test(label)) return orientativeRangeFromPriceLabel(label) ?? label;
  return null;
}

function usefulBadges(business: Business, locale: Locale) {
  return [locationFor(business), priceBadge(business, locale)].filter((item): item is string => Boolean(item?.trim())).slice(0, 2);
}

function CardBodyText({ business, locale }: { business: Business; locale: Locale }) {
  const copy = t(locale);
  const description = realDescriptionFor(business);
  if (description) {
    return <p className="mt-3 line-clamp-3 text-sm leading-6 text-olive">{description}</p>;
  }

  const address = compactAddress(business.address);

  return (
    <div className="mt-3 text-sm leading-6 text-olive">
      {address ? (
        <p className="flex gap-1.5 leading-6">
          <IconRoad size={14} stroke={2} className="mt-1 shrink-0 text-[#6B7280]" />
          <span className="line-clamp-2">{address}</span>
        </p>
      ) : (
        <p className="line-clamp-2">{copy.business.fallbackLine}</p>
      )}
    </div>
  );
}
export function BusinessCard({ business, locale }: { business: Business; locale: Locale }) {
  const copy = t(locale);
  const categorySlug = getCategorySlugFromBusiness(business.category);
  const categoryLabel = categoryLabelForBusiness(business.category, locale);
  const publicName = getBusinessPublicName(business);
  const badges = usefulBadges(business, locale);

  return (
    <article className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-borderline bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0A0A0A] hover:shadow-[0_6px_28px_rgba(10,10,10,0.14)]">
      <Link href={`/${locale}/${categorySlug}/${business.slug}`} className="flex flex-1 flex-col">
        <BusinessImage business={business} category={business.category} variant="card" className="aspect-[4/3] min-h-0 shrink-0">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                <IconMapPin size={12} stroke={2} />
                {business.area || business.city || "Mallorca"}
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-all duration-150 group-hover:bg-[#262626]">
                <IconArrowUpRight size={15} stroke={2} />
              </span>
            </div>
            <h2 className="line-clamp-2 text-2xl font-black leading-tight text-white drop-shadow-sm">{publicName}</h2>
          </div>
        </BusinessImage>

        <div className="flex flex-1 flex-col p-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">{categoryLabel}</p>
            <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
          </div>

          {isUntapped(business.untappedScore) && (
            <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">
              <IconDiamond size={12} stroke={2} />
              {copy.business.hiddenGem}
            </div>
          )}

          <CardBodyText business={business} locale={locale} />

          <div className="mt-auto pt-4">
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[10px] font-semibold text-[#0A0A0A]">
                  {badge}
                </span>
              ))}
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 group-hover:opacity-60">
              {copy.business.viewDataReviews}
              <IconArrowUpRight size={14} stroke={2} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
