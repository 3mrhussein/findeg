"use client";

import * as React from "react";
import { X, Plus, Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Tag } from "@/features/catalog/domain/entities";

interface TagInputProps {
  tags: Tag[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

/**
 * Multi-select tag input with search and badges (Custom implementation without Command primitive)
 */
export function TagInput({
  tags,
  selectedIds,
  onChange,
  placeholder = "Select tags...",
}: TagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));
  const filteredTags = tags.filter(
    (t) =>
      t.key.toLowerCase().includes(search.toLowerCase()) ||
      t.group.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleTag = (id: number) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onChange(newIds);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 minimal-scrollbar max-h-32 overflow-y-auto">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="pl-2 pr-1 py-0.5 gap-1 text-xs font-medium"
            style={{
              backgroundColor: tag.color ? `${tag.color}15` : undefined,
              color: tag.color || undefined,
              borderColor: tag.color ? `${tag.color}30` : undefined,
            }}
          >
            {tag.key}
            <button
              type="button"
              className="rounded-full outline-none hover:bg-black/10 p-0.5"
              onClick={() => toggleTag(tag.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedIds.length === 0 && (
          <span className="text-sm text-muted-foreground italic px-1 py-0.5">No tags selected</span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 text-muted-foreground font-normal"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {placeholder}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="flex flex-col">
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-64">
              <div className="p-1">
                {filteredTags.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No tags found.
                  </div>
                ) : (
                  filteredTags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                          isSelected && "bg-accent/50",
                        )}
                        onClick={() => toggleTag(tag.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: tag.color || "#ccc" }}
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{tag.key}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                              {tag.group}
                            </span>
                          </div>
                          {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
