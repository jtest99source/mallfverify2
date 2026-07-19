import Link from "next/link";
import { IconWorld, IconCircleCheckFilled } from "@tabler/icons-react";
import type { Business, LanguageLevel } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import { methodologyPath } from "@/lib/methodology";
import {
  getLanguageVerification,
  coreLanguageChips,
  levelLabel,
  otherLanguageLabel,
  confirmedAtLabel
} from "@/lib/language-verification";

type Tone = "light" | "dark";

const copy = {
  es: {
    verified: "Idiomas verificados",
    also: "También",
    confirmedBy: "Confirmado por el propio negocio",
    on: (d: string) => `Confirmado en ${d}`,
    how: "Cómo lo verificamos",
    speaks: "Atienden en"
  },
  en: {
    verified: "Verified languages",
    also: "Also",
    confirmedBy: "Confirmed by the business itself",
    on: (d: string) => `Confirmed ${d}`,
    how: "How we verify this",
    speaks: "Speaks"
  },
  de: {
    verified: "Verifizierte Sprachen",
    also: "Auch",
    confirmedBy: "Vom Betrieb selbst bestätigt",
    on: (d: string) => `Bestätigt ${d}`,
    how: "Wie wir das prüfen",
    speaks: "Spricht"
  }
} as const;

function chipClass(level: LanguageLevel, tone: Tone) {
  if (level === "fluent") return "bg-[#00C37A] text-[#07101F]";
  return tone === "dark"
    ? "bg-white/10 text-white/75 ring-1 ring-white/25"
    : "bg-[#07101F]/[0.06] text-[#07101F]/75 ring-1 ring-[#07101F]/15";
}

export function LanguageBadge({
  business,
  locale,
  variant = "compact",
  tone = "dark"
}: {
  business: Pick<Business, "languageVerification">;
  locale: Locale;
  variant?: "compact" | "full";
  tone?: Tone;
}) {
  const lv = getLanguageVerification(business);
  if (!lv) return null;
  const c = copy[locale];
  const chips = coreLanguageChips(lv, locale);

  if (variant === "compact") {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.code}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.04em] ${chipClass(chip.level, tone)}`}
            title={`${c.speaks} ${chip.label} — ${levelLabel(chip.level, locale)}`}
          >
            {chip.level === "fluent" && <IconCircleCheckFilled size={11} />}
            {chip.label}{chip.level === "basic" ? ` · ${levelLabel(chip.level, locale)}` : ""}
          </span>
        ))}
      </span>
    );
  }

  // full — detail page block
  const others = lv.other ?? [];
  const when = confirmedAtLabel(lv.confirmedAt, locale);
  return (
    <section className="rounded-lg border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#00C37A]">
        <IconWorld size={15} stroke={2} />
        {c.verified}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip.code}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${chipClass(chip.level, tone)}`}
          >
            {chip.level === "fluent" && <IconCircleCheckFilled size={13} />}
            {chip.label} · {levelLabel(chip.level, locale)}
          </span>
        ))}
      </div>
      {others.length > 0 && (
        <p className="mt-3 text-xs text-white/60">
          <span className="font-bold text-white/75">{c.also}:</span>{" "}
          {others.map((o) => otherLanguageLabel(o, locale)).join(", ")}
        </p>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/50">
        <span>{c.confirmedBy}{when ? ` · ${c.on(when)}` : ""}.</span>
        <Link href={methodologyPath(locale)} className="font-semibold text-[#00C37A] hover:underline">{c.how} →</Link>
      </p>
    </section>
  );
}
