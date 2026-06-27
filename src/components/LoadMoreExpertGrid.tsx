"use client";

import { useState } from "react";
import Link from "next/link";
import { IconExternalLink, IconPhone } from "@tabler/icons-react";
import { RatingBadge } from "@/components/RatingBadge";
import type { ExpertProfile } from "@/data/expertProfiles";
import type { Locale } from "@/lib/i18n";

const PAGE_SIZE = 24;

const copy = {
  es: {
    loadMore: "Cargar más",
    showing: (shown: string, total: string) => `Mostrando ${shown} de ${total}`
  },
  en: {
    loadMore: "Load more",
    showing: (shown: string, total: string) => `Showing ${shown} of ${total}`
  },
  de: {
    loadMore: "Mehr laden",
    showing: (shown: string, total: string) => `${shown} von ${total} angezeigt`
  }
} as const;

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function localizedList(list: Partial<Record<Locale, string[]>>, locale: Locale): string[] {
  return list[locale] ?? list.es ?? list.en ?? list.de ?? [];
}

function DirectoryCard({
  profile,
  position,
  locale,
  verticalLabel,
  verticalColor,
  hideVertical,
  labels
}: {
  profile: ExpertProfile;
  position: number;
  locale: Locale;
  verticalLabel: string;
  verticalColor: string;
  hideVertical: boolean;
  labels: { languages: string; specialties: string; website: string; phone: string; details: string };
}) {
  const editorialNote = profile.editorialNote?.[locale];
  const specialties = localizedList(profile.specialties, locale);

  return (
    <article
      className="group flex min-h-[260px] flex-col overflow-hidden rounded-sm border border-l-4 border-white/[0.10] bg-[#101010] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-0.5 hover:border-white/[0.22]"
      style={{ borderLeftColor: verticalColor }}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className={`flex flex-wrap items-center gap-2 ${!hideVertical && verticalLabel ? "justify-between" : "justify-end"}`}>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-sm border border-white/[0.10] bg-[#050505] px-2 text-[10px] font-black text-[#FFCC00]">
            #{position}
          </span>
          {!hideVertical && verticalLabel ? (
            <span className="rounded-full bg-[#FFCC00] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
              {verticalLabel}
            </span>
          ) : null}
          <RatingBadge rating={profile.rating} reviewsCount={profile.reviewsCount} locale={locale} compact />
        </div>

        <h3 className="mt-4 text-xl font-black leading-[1.05] text-white">{profile.name}</h3>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-white/48">{labels.languages}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {profile.languages.map((language) => (
                <span key={language} className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-xs font-bold text-white/78">
                  {language}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-white/48">{labels.specialties}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((specialty) => (
                <span key={specialty} className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-xs font-bold text-white/78">
                  {specialty}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {profile.phone ? (
            <a
              href={`tel:${profile.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/[0.12] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/72 hover:border-[#FFCC00]/70 hover:text-white"
            >
              <IconPhone size={13} stroke={1.8} />
              {labels.phone}
            </a>
          ) : null}
          {profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/[0.12] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/72 hover:border-[#FFCC00]/70 hover:text-white"
            >
              {labels.website}
              <IconExternalLink size={13} stroke={1.8} />
            </a>
          ) : null}
          <Link
            href={`/${locale}/experts/${profile.verticalSlug}/${profile.slug}`}
            className="inline-flex items-center gap-1.5 rounded-sm bg-[#FFCC00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white"
          >
            {labels.details}
            <IconExternalLink size={13} stroke={1.8} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LoadMoreExpertGrid({
  profiles,
  locale,
  categories,
  verticalColors,
  activeVertical,
  labels
}: {
  profiles: ExpertProfile[];
  locale: Locale;
  categories: { slug: string; title: string }[];
  verticalColors: Record<string, string>;
  activeVertical: string | null;
  labels: { languages: string; specialties: string; website: string; phone: string; details: string };
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProfiles = profiles.slice(0, visibleCount);
  const c = copy[locale];
  const hasMore = visibleCount < profiles.length;
  const shown = Math.min(visibleCount, profiles.length).toLocaleString(numberLocale(locale));
  const total = profiles.length.toLocaleString(numberLocale(locale));

  return (
    <>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProfiles.map((profile, index) => {
          const category = categories.find((item) => item.slug === profile.verticalSlug);
          return (
            <DirectoryCard
              key={profile.slug}
              profile={profile}
              position={index + 1}
              locale={locale}
              verticalLabel={category?.title ?? ""}
              verticalColor={verticalColors[profile.verticalSlug] ?? "#0A0A0A"}
              hideVertical={!!activeVertical}
              labels={labels}
            />
          );
        })}
      </div>
      {profiles.length > PAGE_SIZE && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/56">{c.showing(shown, total)}</p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, profiles.length))}
              className="min-h-11 rounded-sm border border-[#FFCC00] bg-[#FFCC00] px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] shadow-[0_14px_30px_rgba(255,204,0,0.12)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {c.loadMore}
            </button>
          )}
        </div>
      )}
    </>
  );
}
