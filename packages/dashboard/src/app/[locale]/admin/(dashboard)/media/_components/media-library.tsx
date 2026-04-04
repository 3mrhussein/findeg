"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { Checkbox } from "@findeg/ui";
import { useToast } from "@/hooks/use-toast";
import type { MediaAsset } from "@/features/media/domain/entities/MediaAsset";

interface MediaLibraryProps {
  initialAssets: MediaAsset[];
}

/**
 *
 */
function normalizeFolderLabel(folder: string): string {
  if (folder === "general") return "General";
  if (folder === "products") return "Products";
  if (folder === "brands") return "Brands";
  return folder;
}

/**
 *
 */
export function MediaLibrary({ initialAssets }: MediaLibraryProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("all");

  const visibleAssets = useMemo(() => {
    if (activeFolder === "all") return assets;
    return assets.filter((asset) => asset.folder === activeFolder);
  }, [assets, activeFolder]);

  /**
   *
   */
  const toggleSelected = (url: string, checked: boolean) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (checked) next.add(url);
      else next.delete(url);
      return next;
    });
  };

  /**
   *
   */
  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        description: successMessage,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Clipboard access is not available.",
      });
    }
  };

  /**
   *
   */
  const handleDelete = async (url: string) => {
    if (deletingUrl) return;
    setDeletingUrl(url);

    try {
      const response = await fetch(`/api/v1/media?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || "Failed to delete media file.");
      }

      setAssets((prev) => prev.filter((asset) => asset.url !== url));
      setSelectedUrls((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
      toast({
        title: "Media deleted",
        description: "The selected file was removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unexpected delete error.",
      });
    } finally {
      setDeletingUrl(null);
    }
  };

  if (assets.length === 0) {
    return <div className="text-sm text-muted-foreground">No media files found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeFolder === "all" ? "default" : "outline"}
          onClick={() => setActiveFolder("all")}
        >
          All
        </Button>
        {["general", "products", "brands"].map((folder) => (
          <Button
            key={folder}
            type="button"
            size="sm"
            variant={activeFolder === folder ? "default" : "outline"}
            onClick={() => setActiveFolder(folder)}
          >
            {normalizeFolderLabel(folder)}
          </Button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selectedUrls.size === 0}
            onClick={() =>
              copyText(
                Array.from(selectedUrls).join(", "),
                "Selected media URLs copied. You can paste them into product/brand forms.",
              )
            }
            data-testid="admin-media-copy-selected"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Selected URLs
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedUrls(new Set())}
            disabled={selectedUrls.size === 0}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {visibleAssets.length === 0 ? (
        <div className="text-sm text-muted-foreground">No files in this folder.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleAssets.map((asset) => {
            const checked = selectedUrls.has(asset.url);
            const isDeleting = deletingUrl === asset.url;

            return (
              <div
                key={asset.url}
                className="rounded-lg border bg-background p-2 shadow-sm"
                data-testid={`admin-media-card-${asset.name}`}
              >
                <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                  <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                </div>

                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{asset.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {normalizeFolderLabel(asset.folder)}
                    </Badge>
                  </div>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleSelected(asset.url, Boolean(value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyText(
                        asset.url,
                        "Media URL copied. You can paste it into product/brand form fields.",
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => handleDelete(asset.url)}
                    data-testid={`admin-media-delete-${asset.name}`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
