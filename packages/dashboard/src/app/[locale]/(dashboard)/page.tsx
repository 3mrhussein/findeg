/**
 * Admin Dashboard Page (Phase 6: Nested Suspense)
 *
 * Progressive rendering with three streaming sections:
 * 1. Fast (Greeting + KPI cards) — rendered immediately
 * 2. Medium (Catalog board) — streamed after ~500ms
 * 3. Slow (Analytics, activity) — streamed after ~1000ms
 *
 * Benefits:
 * - Visible content immediately (TTI < 200ms)
 * - Independent fallbacks for each section
 * - No layout shift (explicit skeleton heights)
 * - Better perceived performance
 */

import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@lib/auth-guard";
import { DashboardStatsSkeleton } from "@components/skeletons";
import {
  FastDashboardSection,
  MediumDashboardSection,
  SlowDashboardSection,
} from "./_components/DashboardWidgets";
import {
  MediumDashboardMiniSkeleton,
  SlowDashboardSkeleton,
} from "./_components/DashboardSkeletons";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdmin(locale as any);

  return (
    <div className="space-y-6">
      {/* ================================================
          SECTION 1: FAST CONTENT (Greeting + KPI Cards)
          ================================================
          Renders immediately with quick queries (counts only).
          No skeleton needed - renders so fast user won't see loading state.
      */}
      <FastDashboardSection locale={locale} />

      {/* ================================================
          SECTION 2: MEDIUM CONTENT (Catalog Board)
          ================================================
          Suspense with ~500ms timeout for catalog health stats.
          Shows compact MiniSkeleton if delayed.
      */}
      <Suspense fallback={<MediumDashboardMiniSkeleton />}>
        <MediumDashboardSection locale={locale} />
      </Suspense>

      {/* ================================================
          SECTION 3: SLOW CONTENT (Analytics + Activity)
          ================================================
          Suspense with ~1000ms timeout for heavy queries.
          Shows full SkeletonLayout if delayed (maintains layout space).
      */}
      <Suspense fallback={<SlowDashboardSkeleton />}>
        <SlowDashboardSection locale={locale} />
      </Suspense>
    </div>
  );
}
