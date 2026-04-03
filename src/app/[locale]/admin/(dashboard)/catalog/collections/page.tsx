import { getServices } from "@/server/getServices";
import { CollectionsPageClient } from "./_components/CollectionsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections Management | FindEg Admin",
  description: "Manage catalog collections and marketing banners.",
};

/**
 *
 */
export default async function CollectionsPage() {
  const { adminCollection } = getServices();

  // Sort by sortOrder ascending initially
  const collections = await adminCollection.getAll();
  const sortedCollections = [...collections].sort((a, b) => a.sortOrder - b.sortOrder);

  return <CollectionsPageClient collections={sortedCollections} />;
}
