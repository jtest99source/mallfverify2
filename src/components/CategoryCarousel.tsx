"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";

type Props = {
  categories: { slug: string; label: string }[];
  activeSlug: string;
  locale: string;
};

export function CategoryCarousel({ categories, activeSlug, locale }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
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
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-[#07101F] to-transparent pl-1 pr-6 text-white/50 hover:text-white"
        >
          <span className="text-sm font-bold leading-none">‹</span>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/top/${cat.slug}`}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
              cat.slug === activeSlug
                ? "bg-[#00C37A] text-[#0A0A0A]"
                : "border border-white/[0.12] text-white/50 hover:border-white/30 hover:text-white"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-[#07101F] to-transparent pr-1 pl-6 text-white/50 hover:text-white"
        >
          <span className="text-sm font-bold leading-none">›</span>
        </button>
      )}
    </div>
  );
}
