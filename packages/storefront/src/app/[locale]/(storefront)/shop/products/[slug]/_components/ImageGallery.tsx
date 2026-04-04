"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { Dialog, DialogContent } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  badge?: {
    text: string;
    className: string;
  } | null;
}

/**
 * PDP image gallery with hover zoom, thumbnails and full-screen lightbox.
 */
export function ImageGallery({ images, badge }: ImageGalleryProps) {
  const safeImages = useMemo(
    () =>
      images.length > 0
        ? images
        : [
            {
              url: "https://picsum.photos/seed/findeg-pdp/900/900",
              alt: "Product image",
            },
          ],
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % safeImages.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, safeImages.length]);

  const activeImage = safeImages[activeIndex];

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-2xl bg-muted aspect-square cursor-crosshair"
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt || "Product image"}
          fill
          className="object-cover transition duration-300 group-hover:scale-150"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {badge ? (
          <Badge className={cn("absolute start-3 top-3 z-20 rounded-full", badge.className)}>
            {badge.text}
          </Badge>
        ) : null}

        <div className="absolute bottom-3 end-3 z-20 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {activeIndex + 1} / {safeImages.length}
        </div>
      </button>

      {safeImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border transition",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/60",
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || "Thumbnail"}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-none w-screen h-screen rounded-none border-0 bg-black/95 p-0">
          <div className="relative flex h-full items-center justify-center">
            <Image
              src={activeImage.url}
              alt={activeImage.alt || "Product image"}
              fill
              className="object-contain"
              sizes="100vw"
            />

            {safeImages.length > 1 ? (
              <>
                <IconTooltip label="Previous image" asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute start-4 top-1/2 z-30 -translate-y-1/2 rounded-full"
                    onClick={() =>
                      setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
                    }
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </Button>
                </IconTooltip>

                <IconTooltip label="Next image" asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute end-4 top-1/2 z-30 -translate-y-1/2 rounded-full"
                    onClick={() => setActiveIndex((prev) => (prev + 1) % safeImages.length)}
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </Button>
                </IconTooltip>
              </>
            ) : null}

            <div className="absolute bottom-4 start-1/2 z-30 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white">
              {activeIndex + 1} / {safeImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
