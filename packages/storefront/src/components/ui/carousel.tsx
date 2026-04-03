"use client";

import type { ComponentProps, HTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 *
 */
function Carousel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />;
}

/**
 *
 */
function CarouselContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex overflow-x-auto gap-4 snap-x", className)} {...props} />;
}

/**
 *
 */
function CarouselItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-full snap-start", className)} {...props} />;
}

/**
 *
 */
function CarouselPrevious({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <IconTooltip label="Previous slide" asChild>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("absolute top-1/2 -translate-y-1/2", className)}
        aria-label="Previous slide"
        {...props}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    </IconTooltip>
  );
}

/**
 *
 */
function CarouselNext({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <IconTooltip label="Next slide" asChild>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("absolute top-1/2 -translate-y-1/2", className)}
        aria-label="Next slide"
        {...props}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    </IconTooltip>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
