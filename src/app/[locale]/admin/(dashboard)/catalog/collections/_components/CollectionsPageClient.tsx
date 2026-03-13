"use client";

import { useState } from "react";
import { Collection } from "@/features/catalog/domain/entities/Collection";
import { CollectionGrid } from "./CollectionGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminDeleteCollectionAction } from "@/features/administration/application/actions/admin-collection-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CollectionsPageClientProps {
  collections: Collection[];
}

/**
 *
 */
export function CollectionsPageClient({ collections }: CollectionsPageClientProps) {
  const t = useTranslations("Pages.Dashboard.Collections");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredCollections = collections.filter((c) => {
    const titleEn = c.localizedTitle?.en?.toLowerCase() || "";
    const titleAr = c.localizedTitle?.ar || "";
    const slug = c.slug.toLowerCase();
    const query = search.toLowerCase();

    return titleEn.includes(query) || titleAr.includes(query) || slug.includes(query);
  });

  /**
   *
   */
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const result = await adminDeleteCollectionAction(deleteConfirmId);
    if (result.success) {
      toast({ title: "Collection deleted" });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Title")}</h2>
          <p className="text-muted-foreground text-sm">{t("Subtitle")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/${locale}/admin/catalog/collections/new`}>
              <Plus className="mr-2 h-4 w-4" /> {t("NewCollection")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("SearchPlaceholder")}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <CollectionGrid collections={filteredCollections} onDelete={(id) => setDeleteConfirmId(id)} />

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center text-xl">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete this collection. This action can affect the storefront
              display and currently assigned products will lose this collection reference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
