"use client";

import { useState } from "react";
import { Collection } from "@findeg/backend/features/catalog";
import { CollectionGrid } from "./CollectionGrid";
import { Button } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Plus, Search, Trash, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@findeg/ui";
import { deleteCollectionAction as deleteCollection } from "@data/collections/actions";
import { useToast } from "@hooks/use-toast";
import { useRouter } from "@i18n/navigation";

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
    const result = await deleteCollection(deleteConfirmId);
    if (result.success) {
      toast({ title: "Collection deleted" });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {t("Title")}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">{t("Subtitle")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href={`/${locale}/catalog/collections/new`}>
              <Plus className="mr-2 h-4 w-4" /> {t("NewCollection")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("SearchPlaceholder")}
            className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
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
