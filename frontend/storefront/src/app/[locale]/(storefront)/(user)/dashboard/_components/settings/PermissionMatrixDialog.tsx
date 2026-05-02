/**
 * PermissionMatrixDialog
 *
 * Edits a role's permissions via a Read/Write checkbox table grouped by domain.
 * Applies changes optimistically via the onSave callback.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Checkbox } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import type { RoleWithPermissions, Permission } from "../Settings";

interface PermissionMatrixDialogProps {
  role: RoleWithPermissions | null;
  allPermissions: Permission[];
  onSave: (roleId: number, permissionIds: number[]) => Promise<void>;
  onClose: () => void;
}

/** Groups permissions by their domain segment (admin.<DOMAIN>.<action>) */
function groupByDomain(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {};
  for (const p of permissions) {
    const parts = p.code.split(".");
    const domain = parts[1] ?? "other";
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(p);
  }
  return groups;
}

/**
 *
 */
export function PermissionMatrixDialog({
  role,
  allPermissions,
  onSave,
  onClose,
}: PermissionMatrixDialogProps) {
  const t = useTranslations("Pages.Dashboard");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (role) {
        setSelected(new Set(role.permissions.map((p: any) => p.id)));
      } else {
        setSelected(new Set());
      }
    });
  }, [role]);

  /**
   *
   */
  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /**
   *
   */
  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await onSave(role.id, Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const groups = groupByDomain(allPermissions);

  return (
    <Dialog open={role !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="w-full max-w-[100vw] sm:max-w-2xl h-dvh sm:h-auto rounded-none sm:rounded-lg"
        aria-describedby="matrix-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{t("EditRole")}:</span>
            <span className="text-primary">{role?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <p id="matrix-description" className="text-xs text-muted-foreground -mt-2">
          {t("PermissionMatrixDescription")}
        </p>

        <ScrollArea className="max-h-[calc(100dvh-220px)] sm:max-h-[440px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[60%]">{t("PermissionDomain")}</TableHead>
                <TableHead className="text-center w-[20%]">{t("Read")}</TableHead>
                <TableHead className="text-center w-[20%]">{t("Write")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groups).map(([domain, perms]) => {
                const read = perms.find((p) => p.code.endsWith(".read"));
                const write = perms.find((p) => p.code.endsWith(".write"));
                const standalones = perms.filter(
                  (p) => !p.code.endsWith(".read") && !p.code.endsWith(".write"),
                );
                return (
                  <React.Fragment key={domain}>
                    {(read || write) && (
                      <TableRow className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium capitalize">{domain}</TableCell>
                        <TableCell className="text-center">
                          {read ? (
                            <Checkbox
                              id={`p-${read.id}`}
                              checked={selected.has(read.id)}
                              onCheckedChange={() => toggle(read.id)}
                              aria-label={`${domain} read`}
                            />
                          ) : (
                            <span className="text-muted-foreground/50" aria-hidden>
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {write ? (
                            <Checkbox
                              id={`p-${write.id}`}
                              checked={selected.has(write.id)}
                              onCheckedChange={() => toggle(write.id)}
                              aria-label={`${domain} write`}
                            />
                          ) : (
                            <span className="text-muted-foreground/50" aria-hidden>
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    {standalones.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-center" colSpan={2}>
                          <Checkbox
                            id={`p-${p.id}`}
                            checked={selected.has(p.id)}
                            onCheckedChange={() => toggle(p.id)}
                            aria-label={p.name}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && (
              <Icon name="progress_activity" className="text-base ltr:mr-2 rtl:ml-2 animate-spin" />
            )}
            {t("Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
