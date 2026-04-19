"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@ui";
import { ScrollArea } from "@ui";
import type { Permission, OverrideAction } from "./AdminUserDialog.interface";

interface OverridesTabProps {
  permissions: Permission[];
  overrides: Map<number, OverrideAction>;
  onCycle: (permId: number) => void;
}

const OVERRIDE_ACTIONS: OverrideAction[] = ["default", "grant", "revoke"];

/**
 * Permission overrides tab — per-user grant/revoke cycling UI.
 */
export function OverridesTab({ permissions, overrides, onCycle }: OverridesTabProps) {
  const t = useTranslations("Pages.Dashboard");

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">{t("OverridesDescription")}</p>
      <ScrollArea className="h-64 pr-3">
        <div className="space-y-1.5">
          {permissions.map((perm) => {
            const action = overrides.get(perm.id) ?? "default";
            return (
              <div
                key={perm.id}
                className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{perm.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{perm.code}</p>
                </div>
                <div className="flex gap-1.5">
                  {OVERRIDE_ACTIONS.map((a) => (
                    <Badge
                      key={a}
                      variant={action === a ? "default" : "outline"}
                      className={`cursor-pointer text-xs capitalize ${
                        action === a && a === "grant"
                          ? "bg-green-600"
                          : action === a && a === "revoke"
                            ? "bg-red-600"
                            : ""
                      }`}
                      onClick={() => onCycle(perm.id)}
                    >
                      {a === "default" ? "Role" : a}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
