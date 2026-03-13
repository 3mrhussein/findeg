import { getServices } from "@/server/getServices";
import { TagsPageClient } from "./_components/TagsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags Management | FindEg Admin",
  description: "Manage catalog tags and groupings.",
};

/**
 *
 */
export default async function TagsPage() {
  const { adminTag } = getServices();

  // Fetch data in parallel
  const [tags, groups] = await Promise.all([adminTag.getAll(), adminTag.getDistinctGroups()]);

  return <TagsPageClient tags={tags} groups={groups} />;
}
