"use client";

import { useTranslations } from "next-intl";
import {
  Lock,
  FileText,
  CheckCircle2,
  Timer,
  ShieldQuestion,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccessState } from "../../application/interfaces/ISchoolAccessService";

interface ListAccessCardProps {
  list: any; // Type from schoolLists table
  accessState: AccessState;
  onAction: (action: "enter_code" | "request_access" | "view_list") => void;
}

/**
 * ListAccessCard
 *
 * Displays a single grade list with its current access state controls.
 */
export function ListAccessCard({ list, accessState, onAction }: ListAccessCardProps) {
  const t = useTranslations("School.AccessCard");

  /**
   *
   */
  const getStatusConfig = () => {
    switch (accessState) {
      case "granted":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          label: t("accessGranted"),
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
          buttonLabel: t("viewList"),
          buttonAction: "view_list" as const,
        };
      case "pending":
        return {
          icon: <Timer className="w-5 h-5 text-amber-500" />,
          label: t("accessPending"),
          badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
          buttonLabel: t("checkStatus"),
          buttonAction: null,
        };
      case "code_required":
        return {
          icon: <Lock className="w-5 h-5 text-blue-500" />,
          label: t("codeRequired"),
          badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
          buttonLabel: t("enterCode"),
          buttonAction: "enter_code" as const,
        };
      case "private":
        return {
          icon: <ShieldQuestion className="w-5 h-5 text-slate-500" />,
          label: t("privateList"),
          badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
          buttonLabel: t("requestAccess"),
          buttonAction: "request_access" as const,
        };
      case "public":
      default:
        return {
          icon: <FileText className="w-5 h-5 text-indigo-500" />,
          label: t("publicAccess"),
          badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
          buttonLabel: t("viewList"),
          buttonAction: "view_list" as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="hover:border-primary/20 transition-all duration-300 shadow-sm overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
              {config.icon}
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">{list.grade}</h4>
              <Badge variant="outline" className={`mt-1 font-medium ${config.badgeClass}`}>
                {config.label}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {config.buttonAction ? (
              <Button
                onClick={() => onAction(config.buttonAction!)}
                className="gap-2 shadow-sm"
                variant={
                  accessState === "granted" || accessState === "public" ? "default" : "outline"
                }
              >
                {config.buttonLabel}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button disabled variant="secondary" className="gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {config.buttonLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
