"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@findeg/ui";
import { Button } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";
import { Collection } from "@findeg/backend/features/catalog";
import { cn } from "@lib/utils";

interface CollectionSelectProps {
  allCollections: Collection[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Admin Collection Multi-Select
 */
export function CollectionSelect({
  allCollections,
  selectedIds,
  onChange,
  placeholder = "Select collections...",
  className,
}: CollectionSelectProps) {
  const selectedCollections = allCollections.filter((c) => selectedIds.includes(c.id));

  /**
   *
   */
  const toggleCollection = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  /**
   *
   */
  const removeCollection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((cid) => cid !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-auto min-h-10 px-3 py-2 text-left"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedCollections.length > 0 ? (
                selectedCollections.map((c) => (
                  <Badge key={c.id} variant="secondary" className="pr-1">
                    {c.localizedTitle?.en || c.slug}
                    <button
                      type="button"
                      onClick={(e) => removeCollection(c.id, e)}
                      className="ml-1 rounded-full outline-none hover:bg-black/10 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
          <ScrollArea className="h-60">
            {allCollections.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={selectedIds.includes(c.id)}
                onCheckedChange={() => toggleCollection(c.id)}
                onSelect={(e) => e.preventDefault()}
              >
                {c.localizedTitle?.en || c.slug}
              </DropdownMenuCheckboxItem>
            ))}
            {allCollections.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No collections found
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
