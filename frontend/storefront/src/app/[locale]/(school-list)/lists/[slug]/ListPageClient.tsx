"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { SessionState } from "@findeg/backend/features/school/application/interfaces/IParentListService";
import { ListReturnDialog } from "@app/[locale]/(storefront)/school/_components/ListReturnDialog";
import { ListProgressBar } from "@app/[locale]/(storefront)/school/_components/ListProgressBar";
import { StickyActionBar } from "@app/[locale]/(storefront)/school/_components/StickyActionBar";
import { ListSummaryOverlay } from "@app/[locale]/(storefront)/school/_components/ListSummaryOverlay";

interface ListPageClientProps {
  list: any;
  initialSessionState: SessionState;
  sessionUser: any;
}

/**
 *
 */
export function ListPageClient({ list, initialSessionState, sessionUser }: ListPageClientProps) {
  const t = useTranslations("School.ParentExperience.List");
  const [sessionState, setSessionState] = useState(initialSessionState);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4 pb-32 space-y-8 animate-in fade-in duration-500">
      {/* Returning Visitor Popup */}
      <ListReturnDialog
        state={sessionState}
        list={list}
        onReset={() => {}}
        onContinue={() => setSessionState("has_session")}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black md:text-4xl text-slate-900 leading-tight">
            {list.schoolName}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {list.grade} &middot; {list.academicSystem}
          </p>
        </div>

        <ListProgressBar total={0} reviewed={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Main List Sections (Required & Optional) */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center">
                1
              </span>
              {t("RequiredItems")}
            </h2>
            {/* ListItemRows will go here */}
            <div className="bg-slate-50 border border-dashed rounded-xl p-12 text-center text-muted-foreground italic">
              Loading required items...
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4 flex items-center gap-2">
              <span className="bg-slate-200 text-slate-700 text-xs w-6 h-6 rounded-full flex items-center justify-center">
                2
              </span>
              {t("OptionalItems")}
            </h2>
            <div className="bg-slate-50 border border-dashed rounded-xl p-12 text-center text-muted-foreground italic">
              Loading optional items...
            </div>
          </section>
        </div>

        <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">{t("MyListSummary")}</h3>
            {/* List Summary Content */}
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {t("ReviewAndCheckout")}
            </button>
          </div>
        </aside>
      </div>

      <StickyActionBar onReview={() => setIsSummaryOpen(true)} total={0} itemCount={0} />

      {isSummaryOpen && (
        <ListSummaryOverlay
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          list={list}
        />
      )}
    </div>
  );
}
