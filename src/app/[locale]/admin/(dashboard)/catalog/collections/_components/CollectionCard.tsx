"use client";

import { Collection } from "@/features/catalog/domain/entities/Collection";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Trash, Eye, EyeOff, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";

interface CollectionCardProps {
  collection: Collection;
  onDelete: (id: number) => void;
}

/**
 *
 */
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
      className={cn("relative group", isDragging && "opacity-50")}
    >
      <Card
        className={cn(
          "h-full overflow-hidden transition-all hover:shadow-md border-2",
          isDragging ? "border-primary" : "border-transparent",
        )}
      >
        <div className="relative aspect-video bg-muted overflow-hidden">
          {collection.heroImageUrl ? (
            <Image src={collection.heroImageUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/30">
              No Image
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-1">
            <Badge
              variant={collection.isActive ? "default" : "secondary"}
              className="h-5 text-[10px] px-1.5 shadow-sm"
            >
              {collection.isActive ? (
                <Eye className="w-3 h-3 mr-1" />
              ) : (
                <EyeOff className="w-3 h-3 mr-1" />
              )}
              {collection.isActive ? "Active" : "Hidden"}
            </Badge>
          </div>

          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 bg-background/80 rounded border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Move className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded">
              #{collection.sortOrder}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">{collection.slug}</p>
        </CardHeader>

        <CardContent className="p-4 pt-0 min-h-[40px]">
          {collection.localizedSubtitle?.[locale as "en" | "ar"] && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {collection.localizedSubtitle[locale as "en" | "ar"]}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-3 border-t bg-muted/50 flex justify-between gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 flex-1">
            <Link href={`/${locale}/admin/catalog/collections/${collection.id}`}>
              <Edit className="w-3 h-3 mr-1.5" /> Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(collection.id as number)}
          >
            <Trash className="w-3 h-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
