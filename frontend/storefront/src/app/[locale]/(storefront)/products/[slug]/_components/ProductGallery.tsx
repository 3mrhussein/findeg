'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@findeg/ui';
import { Card, CardContent } from '@findeg/ui';
import { Button } from '@findeg/ui';

interface ProductGalleryProps {
  images: string[];
}

/**
 *
 */
export function ProductGallery({ images }: ProductGalleryProps) {
  const t = useTranslations();

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
        <span className="text-muted-foreground">{t('Pages.ProductDetail.NoImages')}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-0 relative overflow-hidden rounded-md">
                    <Image
                      src={src}
                      alt={t('Pages.ProductDetail.ImageAlt', { index: index + 1 })}
                      fill
                      className="object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      {/* Thumbnail strip could go here */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((src, index) => (
          <Button
            variant="outline"
            type="button"
            key={index}
            className="relative w-20 h-20 shrink-0 cursor-pointer overflow-hidden hover:border-primary transition-colors p-0 rounded-md"
            aria-label={t('Pages.ProductDetail.ThumbnailLabel', { index: index + 1 })}
          >
            <Image
              src={src}
              alt={t('Pages.ProductDetail.ThumbnailAlt', { index: index + 1 })}
              fill
              className="object-cover"
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
