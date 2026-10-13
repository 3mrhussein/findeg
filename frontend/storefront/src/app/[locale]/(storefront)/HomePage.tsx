import type { Locale } from '@findeg/domain';
import { Suspense } from 'react';

// Sub-components
import { HeroSection } from './_components/home/HeroSection';
import { HowItWorks } from './_components/home/HowItWorks';
import { CollectionsGrid } from './_components/home/CollectionsGrid';
import { NewArrivals } from './_components/home/NewArrivals';
import { SchoolBanner } from './_components/home/SchoolBanner';
import styles from './home-page-demo.module.css';

interface HomePageProps {
  language?: Locale;
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
export default async function HomePage({ language = 'en' }: HomePageProps) {
  return (
    <main className={styles.page}>
      {/* Pure static — no data, renders at build time */}
      {/* <Boundary rendering="static" hydration="server" label="Hero"> */}
      <div className={styles.hero}>
        <HeroSection locale={language} />
      </div>
      {/* </Boundary> */}

      {/* Cached with 'use cache' — included in static shell */}
      {/* <Boundary rendering="static" hydration="server" label="Collections"> */}
      <div className={styles.collections}>
        <Suspense fallback={null}>
          <CollectionsGrid locale={language} />
        </Suspense>
      </div>
      {/* </Boundary> */}

      {/* Cached with 'use cache' — included in static shell */}
      {/* <Boundary rendering="static" hydration="server" label="New Arrivals"> */}
      <div className={styles.arrivals}>
        <Suspense fallback={null}>
          <NewArrivals locale={language} />
        </Suspense>
      </div>
      {/* </Boundary> */}

      {/* Pure static — no data, renders at build time */}
      {/* <Boundary rendering="static" hydration="server" label="How it works"> */}
      <div className={styles.howItWorks}>
        <HowItWorks />
      </div>
      {/* </Boundary> */}

      {/* Pure static — locale text only */}
      {/* <Boundary rendering="static" hydration="server" label="School Banner"> */}
      <div className={styles.school}>
        <SchoolBanner locale={language} />
      </div>
      {/* </Boundary> */}
    </main>
  );
}
