import { CollectionForm } from "../_components/CollectionForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Collection | FindEg Admin",
};

/**
 *
 */
export default async function NewCollectionPage() {
  // TODO: Replace with data layer query from @data/tags/queries
  const availableTags: any[] = []; // Stubbed - empty tags list

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionForm availableTags={availableTags} />
    </div>
  );
}
