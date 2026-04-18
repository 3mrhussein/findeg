import { getAllTagsGrouped } from "@data/resources/queries";
import { TagsClient } from "./_components/TagsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags Management | FindEg Admin",
  description: "Manage catalog tags and groupings.",
};

export default async function TagsPage() {
  const groupedTags = await getAllTagsGrouped();

  return (
    <div className="flex-1">
      <TagsClient initialTags={groupedTags} />
    </div>
  );
}
