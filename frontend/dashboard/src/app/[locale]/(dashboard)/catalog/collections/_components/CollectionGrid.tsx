"use client";

import { useState, useEffect } from "react";
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
} from "@dnd-kit/sortable";
import { Collection } from "@findeg/backend/features/catalog";
import { CollectionCard } from "./CollectionCard";
import {
  createCollectionAction as createCollection,
  updateCollectionAction as updateCollection,
  reorderCollectionsAction as reorderCollections,
} from "@data/collections/actions";

import { useToast } from "@hooks/use-toast";
import { useRouter } from "@i18n/navigation";

interface CollectionGridProps {
  collections: Collection[];
  onDelete: (id: number) => void;
}

/**
 *
 */
export function CollectionGrid({ collections, onDelete }: CollectionGridProps) {
  const [items, setItems] = useState(collections);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    Promise.resolve().then(() => {
      setItems(collections);
    });
  }, [collections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   *
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update local state immediately for responsiveness
      setItems(newItems);

      // Prepare reorder data
      const reorderData = newItems.map((item, index) => ({
        id: item.id as number,
        sortOrder: index + 1,
      }));

      // Call server action
      const result = await reorderCollections(reorderData);
      if (result.success) {
        toast({ title: "Order saved" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Failed to save order", description: result.error });
        // Revert on failure
        setItems(items);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No collections found.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((i) => i.id as number)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {items.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
