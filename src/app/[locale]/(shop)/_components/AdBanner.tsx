/**
 * Ad Banner Molecule (Server Component)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdBannerProps {
  className?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

/**
 *
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  className = "",
  title = "Ready for a new experience?",
  subtitle = "Discover our latest collection and special offers.",
  ctaText = "Shop Collection",
  ctaHref = "/shop",
}) => {
  return (
    <div className={`bg-primary/5 border border-primary/10 rounded-2xl p-10 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>
        </div>
        <Link href={ctaHref}>
          <Button size="lg" className="px-10 h-14 text-lg">
            {ctaText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
