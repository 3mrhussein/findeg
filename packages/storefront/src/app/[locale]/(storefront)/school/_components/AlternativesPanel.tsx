"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@findeg/ui";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alternative {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
}

interface AlternativesPanelProps {
  alternatives: Alternative[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 *
 */
export function AlternativesPanel({
  alternatives,
  selectedId,
  onSelect,
  onClose,
}: AlternativesPanelProps) {
  const t = useTranslations("School.ParentExperience.Alternatives");

  return (
    <div className="bg-white border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-700">{t("Title")}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto p-2">
        <div className="grid grid-cols-1 gap-1">
          {alternatives.map((alt) => {
            const isSelected = alt.id === selectedId;
            return (
              <button
                key={alt.id}
                onClick={() => onSelect(alt.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isSelected ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-slate-50",
                )}
              >
                <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center p-1 shrink-0">
                  <img
                    src={alt.image || "https://placehold.co/50x50"}
                    alt={alt.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{alt.name}</p>
                  <p className="text-xs text-muted-foreground">{alt.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{alt.price} EGP</p>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase">
                      <Check className="w-3 h-3" /> {t("Selected")}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
