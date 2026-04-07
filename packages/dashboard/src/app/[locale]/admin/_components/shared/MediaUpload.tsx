/**
 * MediaUpload Component
 *
 * Image URL upload input with live preview, remove, and reorder.
 * Used in product forms, variant images, category icons.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Input } from "@ui";
import { Button } from "@ui";
import { Label } from "@ui";
import { cn } from "@lib/utils";
import Image from "next/image";

export interface MediaItem {
  /** Image URL */
  url: string;
  /** Optional alt text */
  alt?: string;
  /** Featured/primary image flag */
  featured?: boolean;
}

export interface MediaUploadProps {
  /** Current images */
  images: MediaItem[];
  /** Change handler */
  onChange: (images: MediaItem[]) => void;
  /** Max images allowed */
  maxImages?: number;
  /** Allow featured image selection */
  allowFeatured?: boolean;
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MediaUpload — Image URL upload with preview
 *
 * Features:
 * - URL input with live preview
 * - Remove images
 * - Drag-to-reorder (TODO with @dnd-kit)
 * - Featured image selection
 *
 * @example
 * <MediaUpload
 *   images={productImages}
 *   onChange={setProductImages}
 *   maxImages={5}
 *   allowFeatured
 *   label="Product Images"
 *   helperText="★ = featured image"
 * />
 */
export function MediaUpload({
  images,
  onChange,
  maxImages = 10,
  allowFeatured = false,
  label,
  helperText,
  className,
}: MediaUploadProps) {
  const [newUrl, setNewUrl] = React.useState("");

  const handleAddImage = () => {
    if (!newUrl.trim()) return;
    if (images.length >= maxImages) return;

    const newImage: MediaItem = {
      url: newUrl.trim(),
      featured: images.length === 0 && allowFeatured, // First image is featured by default
    };

    onChange([...images, newImage]);
    setNewUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetFeatured = (index: number) => {
    if (!allowFeatured) return;
    const updated = images.map((img, i) => ({
      ...img,
      featured: i === index,
    }));
    onChange(updated);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {helperText && <span className="ms-2 text-xs text-muted-foreground">{helperText}</span>}
        </Label>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={index}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2",
                img.featured ? "border-primary" : "border-border",
              )}
            >
              {/* Image */}
              <Image
                src={img.url}
                alt={img.alt || `Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
              />

              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                {allowFeatured && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handleSetFeatured(index)}
                    title={img.featured ? "Featured" : "Set as featured"}
                  >
                    <span className="text-lg">★</span>
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Featured badge */}
              {img.featured && (
                <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  ★ Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Image */}
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
            }}
          />
          <Button type="button" onClick={handleAddImage} disabled={!newUrl.trim()}>
            <Plus className="me-2 h-4 w-4" />
            Add
          </Button>
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground">Maximum {maxImages} images reached</p>
      )}
    </div>
  );
}
