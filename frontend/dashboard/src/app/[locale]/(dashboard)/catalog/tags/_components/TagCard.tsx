"use client";

import { useTranslations, useLocale } from "next-intl";
import { Tag } from "@backend/features/catalog";
import { Card, CardContent } from "@ui";
import { Button } from "@ui";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { getTagDisplayName } from "../../../../../../features/catalog/presentation/config/tag-display";
import { cn } from "@lib/utils";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onToggle: (tag: Tag) => void;
}

export function TagCard({ tag, onEdit, onDelete, onToggle }: TagCardProps) {
  const t = useTranslations("Administration.Catalog.Tags");
  const locale = useLocale() as "en" | "ar";
  const displayName = getTagDisplayName(tag.key, locale);

  // Dynamically render the icon
  // Note: the icon string should match a lucide-react export Name
  const IconComponent =
    ((Icons as unknown as Record<string, LucideIcon>)[tag.icon || "Tag"] as LucideIcon) ||
    Icons.Tag;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        !tag.isActive && "opacity-60 grayscale-[0.5]",
      )}
    >
      <CardContent className="p-5 flex flex-col h-full relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : "#f3f4f6",
                color: tag.color || "#4b5563",
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight flex items-center gap-2">
                {displayName}
                <span
                  className={cn(
                    "w-2 h-2 rounded-full inline-block",
                    tag.isActive ? "bg-green-500" : "bg-gray-300",
                  )}
                />
              </h3>
              <p className="text-sm text-muted-foreground">{tag.key}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="text-xs uppercase font-medium bg-muted px-2 py-1 rounded text-muted-foreground flex items-center">
            {tag.scope}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onToggle(tag)}
              title={tag.isActive ? t("FieldStatus") : t("FieldStatus")}
            >
              {tag.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-blue-600"
              onClick={() => onEdit(tag)}
              title={t("EditTag")}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(tag)}
              title={t("DeleteConfirmTitle", { key: tag.key })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
