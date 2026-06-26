"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

type BusinessGalleryMosaicProps = {
  images: string[];
  businessName: string;
};

export function BusinessGalleryMosaic({ images, businessName }: BusinessGalleryMosaicProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const usableImages = useMemo(() => images.filter(Boolean), [images]);

  if (usableImages.length <= 1) return null;

  const visibleImages = usableImages.slice(0, 5);
  const remaining = Math.max(0, usableImages.length - visibleImages.length);
  const slides = usableImages.map((src, imageIndex) => ({
    src,
    alt: `${businessName} - foto ${imageIndex + 1}`
  }));

  function openAt(imageIndex: number) {
    setIndex(imageIndex);
    setOpen(true);
  }

  return (
    <section className="bg-paper py-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="flex gap-2 overflow-x-auto sm:grid sm:h-96 sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2 sm:gap-1 sm:overflow-hidden sm:rounded-lg">
          {visibleImages.map((image, imageIndex) => {
            const isMain = imageIndex === 0;
            const isLastVisible = imageIndex === visibleImages.length - 1;

            return (
              <button
                key={`${image}-${imageIndex}`}
                type="button"
                onClick={() => openAt(imageIndex)}
                className={`group relative block aspect-[4/3] shrink-0 basis-[78%] overflow-hidden bg-ink text-left sm:aspect-auto sm:basis-auto ${isMain ? "sm:row-span-2" : ""}`}
                aria-label={`Abrir ${businessName} foto ${imageIndex + 1}`}
              >
                <Image
                  src={image}
                  alt={`${businessName} - foto ${imageIndex + 1}`}
                  fill
                  sizes={isMain ? "(min-width: 640px) 600px, 78vw" : "(min-width: 640px) 300px, 78vw"}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  unoptimized
                />

                {isMain && (
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/65 text-lg leading-none text-paper" aria-hidden="true">
                    ⛶
                  </span>
                )}

                {isLastVisible && remaining > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/55 text-sm font-semibold text-paper">
                    <span aria-hidden="true">▣</span>
                    +{remaining} fotos
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Lightbox open={open} close={() => setOpen(false)} index={index} slides={slides} plugins={[Zoom, Thumbnails]} />
    </section>
  );
}
