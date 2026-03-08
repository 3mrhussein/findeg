"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, GripVertical, UploadCloud } from "lucide-react";

/**
 * Sortable Image Item Component
 */
function SortableImageItem({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group w-32 h-32 rounded-lg border bg-muted overflow-hidden flex-shrink-0"
    >
      <img src={url} alt="Product" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 bg-background/80 rounded-md cursor-grab active:cursor-grabbing hover:bg-background"
        >
          <GripVertical className="w-4 h-4 text-foreground" />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 bg-destructive/80 text-destructive-foreground rounded-md hover:bg-destructive"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Product Media Component
 */
export function ProductMedia() {
  const form = useFormContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => {
        // field.value is a comma-separated string
        const images: string[] = field.value
          ? field.value
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            // Simulate upload by adding a placeholder image for each dropped file.
            // In a real app, you would upload these files and use the returned URLs.
            const newImages = acceptedFiles.map(
              () =>
                `https://placehold.co/400x400/png?text=New+Img+${Math.random().toString(36).substring(7)}`,
            );
            field.onChange([...images, ...newImages].join(", "));
          },
          [images, field],
        );

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
        });

        /**
         *
         */
        const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);
            const newOrder = arrayMove(images, oldIndex, newIndex);
            field.onChange(newOrder.join(", "));
          }
        };

        /**
         *
         */
        const handleRemove = (urlToRemove: string) => {
          field.onChange(images.filter((url) => url !== urlToRemove).join(", "));
        };

        return (
          <FormItem className="space-y-4">
            <div>
              <FormLabel>Media</FormLabel>
              <p className="text-[0.8rem] text-muted-foreground">
                Drag and drop images to reorder them. The first image will be used as the thumbnail.
              </p>
            </div>

            <div className="space-y-4">
              {/* Image Grid */}
              {images.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images} strategy={horizontalListSortingStrategy}>
                    <div className="flex flex-wrap gap-4">
                      {images.map((url) => (
                        <SortableImageItem
                          key={url}
                          id={url}
                          url={url}
                          onRemove={() => handleRemove(url)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Dropzone */}
              <FormControl>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <UploadCloud className="w-8 h-8" />
                    <p className="text-sm font-medium">
                      {isDragActive
                        ? "Drop the files here..."
                        : "Drag & drop images here, or click to select files"}
                    </p>
                    <p className="text-xs">Supports JPG, PNG and WEBP (max 2MB)</p>
                  </div>
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
