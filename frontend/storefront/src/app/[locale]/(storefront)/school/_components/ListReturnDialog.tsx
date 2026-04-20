"use client";

import React from "react";
import { Dialog, DialogContent } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { useTranslations } from "next-intl";
import { SessionState } from "@findeg/backend/features/school/application/interfaces/IParentListService";
import { ShoppingBag } from "lucide-react";

interface ListReturnDialogProps {
  state: SessionState;
  list: any;
  user?: any;
  onReset: () => void;
  onContinue: () => void;
}

/**
 * Dialog shown to returning visitors to choose between their saved session or the school default.
 */
export function ListReturnDialog({
  state,
  list,
  user,
  onReset,
  onContinue,
}: ListReturnDialogProps) {
  const t = useTranslations("School.ParentExperience.ReturnDialog");

  if (state === "first_visit") return null;

  const isOpen = state === "has_session" || state === "completed_order";

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="relative h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/40 to-transparent" />
          <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-xl">
            <ShoppingBag className="w-full h-full text-primary" />
          </div>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {t("WelcomeBack", { name: user?.firstName || "Friend" })}
            </h2>
            <p className="text-slate-500 font-medium">
              {state === "completed_order" ? t("OrderCompleted") : t("ResumeSession")}
            </p>
          </div>

          {state === "has_session" && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-sm font-bold text-slate-700">
                {t("SavedChanges", { swapped: 0, removed: 0 })}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {state === "completed_order" ? (
              <>
                <Button className="h-14 rounded-xl text-lg font-bold">{t("TrackOrder")}</Button>
                <Button
                  variant="outline"
                  className="h-14 rounded-xl text-lg font-bold"
                  onClick={onReset}
                >
                  {t("StartNew")}
                </Button>
              </>
            ) : (
              <>
                <Button className="h-14 rounded-xl text-lg font-bold" onClick={onContinue}>
                  {t("UseMyVersion")}
                </Button>
                <Button
                  variant="outline"
                  className="h-14 rounded-xl text-lg font-bold"
                  onClick={onReset}
                >
                  {t("UseSchoolDefaults")}
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium pt-2">
            {state === "completed_order" ? t("ViewOnly") : t("Reassurance")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
