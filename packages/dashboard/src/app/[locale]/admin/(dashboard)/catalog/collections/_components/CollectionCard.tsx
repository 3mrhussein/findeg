"use client";

import { Collection } from "@/features/catalog/domain/entities/Collection";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Trash, Eye, EyeOff, Move, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface CollectionCardProps {
  collection: Collection;
  onDelete: (id: number) => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const locale = useLocale();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collection.id as number,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const title = collection.localizedTitle?.[locale as "en" | "ar"] || collection.slug;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200",
        "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800",
        "hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-500/5",
        isDragging && "opacity-50 ring-1 ring-indigo-200 dark:ring-indigo-800",
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="mr-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-colors hidden sm:block"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          #{collection.sortOrder}
        </span>
        <StatusBadge status={collection.isActive ? "active" : "inactive"} />
      </div>

      {/* Collection Image */}
      <div className="relative h-12 w-16 sm:h-16 sm:w-24 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-indigo-100 transition-colors">
        {collection.heroImageUrl ? (
          <Image
            src={collection.heroImageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 64px, 96px"
          />
        ) : (
          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest text-center px-1">
            {title.slice(0, 3)}
          </span>
        )}
      </div>

      {/* Collection Info */}
      <div className="flex-1 min-w-0 mx-3 sm:mx-4">
        <div className="flex flex-col mb-0.5 pr-20">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">
            {title}
          </h3>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 font-mono truncate">
            {collection.slug}
          </span>
        </div>

        {collection.localizedSubtitle?.[locale as "en" | "ar"] && (
          <p className="mt-1 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-sm italic pr-20">
            {collection.localizedSubtitle[locale as "en" | "ar"]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity mr-2 sm:mr-20 z-10 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 rounded-md text-slate-400 bg-transparent hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                <Link href={`/${locale}/admin/catalog/collections/${collection.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit collection</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(collection.id as number);
                }}
                className="h-8 w-8 rounded-md text-slate-400 bg-transparent hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete collection"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete collection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Interaction Layer - for clicking the card itself on mobile */}
      <Link
        href={`/${locale}/admin/catalog/collections/${collection.id}`}
        className="absolute inset-0 z-0 text-transparent outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 rounded-2xl cursor-pointer"
        aria-label={`Edit ${title}`}
      >
        Edit
      </Link>
    </div>
  );
}
