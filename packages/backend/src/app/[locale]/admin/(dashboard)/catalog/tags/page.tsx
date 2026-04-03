import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { TagsClient } from "./_components/TagsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags Management | FindEg Admin",
  description: "Manage catalog tags and groupings.",
};

export default async function TagsPage() {
  const adminTagService = container.adminTagService;
  const groupedTags = await adminTagService.getAllTagsGrouped();

  return (
    <div className="flex-1">
      <TagsClient initialTags={groupedTags} />
    </div>
  );
}
