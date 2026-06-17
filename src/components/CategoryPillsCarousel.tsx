"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { categoryConfigs, type CategorySlug } from "@/lib/data";
import { getCategoryCopy } from "@/lib/i18n-copy";
import type { Locale } from "@/lib/i18n";

export function CategoryPillsCarousel({ locale }: { locale: Locale }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center">
      {/* Left arrow */}
      <div
        className={`absolute left-0 top-0 z-10 hidden h-full items-center transition-opacity duration-200 sm:flex ${showLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/80 to-transparent" />
        <button
          type="button"
          onClick={() => scroll("left")}
          className="relative z-10 ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#D6CCBF] bg-white text-ink shadow-[0_2px_8px_rgba(27,46,75,0.12)] transition-all duration-150 hover:border-ink hover:shadow-[0_4px_12px_rgba(27,46,75,0.18)]"
          aria-label="Ver categorías anteriores"
          tabIndex={showLeft ? 0 : -1}
        >
          <IconChevronLeft size={16} stroke={2.5} />
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex w-full snap-x items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(Object.entries(categoryConfigs) as [CategorySlug, (typeof categoryConfigs)[CategorySlug]][]).map(([slug, config]) => (
          <Link
            key={slug}
            href={`/${locale}/top/${slug}`}
            className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E7DED0] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink transition-all duration-150 hover:border-ink hover:bg-ink hover:text-white"
          >
            {getCategoryCopy(slug, locale).label}
          </Link>
        ))}
        {/* Spacer so last pill is never hidden under the right arrow */}
        <span className="shrink-0 w-8" aria-hidden="true" />
      </div>

      {/* Right arrow */}
      <div
        className={`absolute right-0 top-0 z-10 hidden h-full items-center justify-end transition-opacity duration-200 sm:flex ${showRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FFFDF7] via-[#FFFDF7]/80 to-transparent" />
        <button
          type="button"
          onClick={() => scroll("right")}
          className="relative z-10 mr-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#D6CCBF] bg-white text-ink shadow-[0_2px_8px_rgba(27,46,75,0.12)] transition-all duration-150 hover:border-ink hover:shadow-[0_4px_12px_rgba(27,46,75,0.18)]"
          aria-label="Ver más categorías"
          tabIndex={showRight ? 0 : -1}
        >
          <IconChevronRight size={16} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}
