"use client";

import * as React from "react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Collection } from "@findeg/backend/features/catalog";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@lib/utils";
import { Badge } from "@findeg/ui";

interface SortableCollectionListProps {
  collections: Collection[];
  onReorder: (items: { id: number; sortOrder: number }[]) => void;
  onEdit?: (id: number) => void;
}

/**
 * Sortable Collection List
 *
 * Uses dnd-kit to allow drag-and-drop reordering of collections.
 */
export function SortableCollectionList({
  collections: initialCollections,
  onReorder,
  onEdit,
}: SortableCollectionListProps) {
  const [items, setItems] = React.useState(initialCollections);

  React.useEffect(() => {
    setItems(initialCollections);
  }, [initialCollections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   *
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        // Map to new sort orders (1-based index)
        const reordered = newItems.map((item, index) => ({
          id: item.id as number,
          sortOrder: index + 1,
        }));

        onReorder(reordered);
        return newItems;
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((collection) => (
            <SortableItem key={collection.id} collection={collection} onEdit={onEdit} />
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
              No collections found. Create one to get started.
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  collection: Collection;
  onEdit?: (id: number) => void;
}

/**
 *
 */
function SortableItem({ collection, onEdit }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collection.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow",
        isDragging && "shadow-lg border-primary/50 opacity-50",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">
            {collection.localizedTitle?.en || collection.slug}
          </h4>
          {!collection.isActive && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase opacity-60">
              <EyeOff className="h-2.5 w-2.5 mr-1" /> Inactive
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{collection.slug}</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-[10px]">
          Order: {collection.sortOrder}
        </Badge>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(collection.id as number)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

// Minimal Button component to avoid heavy imports if possible, but we use shadcn usually
import { Button } from "@findeg/ui";
