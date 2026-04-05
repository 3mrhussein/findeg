import { getServices } from "@/server/getServices";
import { CollectionForm } from "../_components/CollectionForm";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface CollectionEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 *
 */
export async function generateMetadata({ params }: CollectionEditPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Collection #${id} | FindEg Admin`,
  };
}

/**
 *
 */
export default async function CollectionEditPage({ params }: CollectionEditPageProps) {
  const { id } = await params;
  const { adminCollection, adminTag } = getServices();

  const [collection, availableTags] = await Promise.all([
    adminCollection.getById(Number(id)),
    adminTag.getAll(),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionForm collection={collection} availableTags={availableTags} />
    </div>
  );
}
