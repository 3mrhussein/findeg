"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@findeg/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Checkbox } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import type { Permission } from "../Settings";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  onCreate: (code: string, name: string, permIds: number[]) => Promise<void>;
}

/**
 *
 */
export function CreateRoleDialog({
  open,
  onOpenChange,
  permissions,
  onCreate,
}: CreateRoleDialogProps) {
  const t = useTranslations("Pages.Dashboard");

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newPermIds, setNewPermIds] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setNewCode("");
        setNewName("");
        setNewPermIds(new Set());
      });
    }
  }, [open]);

  /**
   *
   */
  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreate(newCode, newName, Array.from(newPermIds));
      onOpenChange(false);
    } catch (err) {
      // Error is handled by parent (toast)
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="max-w-lg" aria-describedby="create-role-desc">
        <DialogHeader>
          <DialogTitle>{t("NewRole")}</DialogTitle>
        </DialogHeader>
        <p id="create-role-desc" className="text-xs text-muted-foreground -mt-2">
          {t("NewRoleDescription")}
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-code">
              {t("RoleCode")}
              <span className="text-muted-foreground text-xs ltr:ml-1 rtl:mr-1">
                (e.g. content_editor)
              </span>
            </Label>
            <Input
              id="role-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="role_code"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-name">{t("RoleName")}</Label>
            <Input
              id="role-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Content Editor"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("Permissions")}</Label>
            <ScrollArea className="h-52 border rounded-md p-3">
              <div className="space-y-2">
                {permissions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <Checkbox
                      id={`np-${p.id}`}
                      checked={newPermIds.has(p.id)}
                      onCheckedChange={() =>
                        setNewPermIds((prev) => {
                          const s = new Set(prev);
                          s.has(p.id) ? s.delete(p.id) : s.add(p.id);
                          return s;
                        })
                      }
                    />
                    <span className="text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground font-mono ltr:ml-auto rtl:mr-auto">
                      {p.code}
                    </span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={creating || !newCode || !newName}>
            {creating && (
              <Icon name="progress_activity" className="text-base ltr:mr-2 rtl:ml-2 animate-spin" />
            )}
            {t("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
