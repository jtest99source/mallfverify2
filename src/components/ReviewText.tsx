"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const LABELS: Record<Locale, { more: string; less: string }> = {
  es: { more: "Leer más", less: "Leer menos" },
  en: { more: "Read more", less: "Read less" },
  de: { more: "Mehr lesen", less: "Weniger lesen" }
};

const COLLAPSED_MAX = 280;

function truncateAtWord(text: string, max: number) {
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trim();
}

export function ReviewText({ text, locale }: { text: string; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const labels = LABELS[locale] ?? LABELS.es;

  if (text.length <= COLLAPSED_MAX) {
    return <p>{text}</p>;
  }

  const short = truncateAtWord(text, COLLAPSED_MAX);

  return (
    <p>
      {expanded ? text : `${short}… `}
      <button type="button" className="rv-more" onClick={() => setExpanded((v) => !v)}>
        {expanded ? labels.less : labels.more}
      </button>
    </p>
  );
}
