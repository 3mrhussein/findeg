"use client";

import { useState } from "react";
import { Tag } from "@/features/catalog/domain/entities/Tag";
import { TagsTable } from "./TagsTable";
import { TagDrawer } from "./TagDrawer";
import { useTranslations } from "next-intl";

interface TagsPageClientProps {
  tags: Tag[];
  groups: string[];
}

/**
 *
 */
export function TagsPageClient({ tags, groups }: TagsPageClientProps) {
  const t = useTranslations("Pages.Dashboard.Tags");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  /**
   *
   */
  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDrawerOpen(true);
  };

  /**
   *
   */
  const handleNew = () => {
    setSelectedTag(undefined);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Title")}</h2>
          <p className="text-muted-foreground text-sm">{t("Subtitle")}</p>
        </div>
      </div>

      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <TagsTable tags={tags} groups={groups} onEdit={handleEdit} onNew={handleNew} />
      </div>

      <TagDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        tag={selectedTag}
        groups={groups}
      />
    </div>
  );
}
