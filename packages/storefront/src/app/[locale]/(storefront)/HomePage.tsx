import { Suspense } from "react";

// Sub-components
import { HeroSection } from "./_components/home/HeroSection";
import { HowItWorks } from "./_components/home/HowItWorks";
import { CollectionsGrid } from "./_components/home/CollectionsGrid";
import { NewArrivals } from "./_components/home/NewArrivals";
import { SchoolBanner } from "./_components/home/SchoolBanner";
import { NewsletterSection } from "./_components/home/NewsletterSection";
import Boundary from "@lib/internal/Boundary";

interface HomePageProps {
  language?: string;
}

/**
 * Home page root component.
 *
 * Each section fetches its own data (collocated data fetching) and is
 * individually cached via `'use cache'` in the sub-component. This page
 * itself is NOT cached — it is a thin orchestrator that renders the
 * pre-rendered static shell with PPR.
 *
 * Dynamic holes (currently none) would be wrapped in `<Suspense>` below.
 */
export default async function HomePage({ language = "en" }: HomePageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
      {/* Pure static — no data, renders at build time */}
      <Boundary rendering="static" hydration="server" label="Hero">
        <HeroSection />
      </Boundary>

      {/* Pure static — no data, renders at build time */}
      <Boundary rendering="static" hydration="server" label="How it works">
        <HowItWorks />
      </Boundary>

      {/* Cached with 'use cache' — included in static shell */}
      <Boundary rendering="static" hydration="server" label="Collections">
        <Suspense fallback={null}>
          <CollectionsGrid locale={language} />
        </Suspense>
      </Boundary>

      {/* Cached with 'use cache' — included in static shell */}
      <Boundary rendering="static" hydration="server" label="New Arrivals">
        <Suspense fallback={null}>
          <NewArrivals locale={language} />
        </Suspense>
      </Boundary>

      {/* Pure static — locale text only */}
      <Boundary rendering="static" hydration="server" label="School Banner">
        <SchoolBanner locale={language} />
      </Boundary>

      {/* Pure static — no data */}
      <Boundary rendering="static" hydration="server" label="Newsletter">
        <NewsletterSection />
      </Boundary>
    </div>
  );
}
