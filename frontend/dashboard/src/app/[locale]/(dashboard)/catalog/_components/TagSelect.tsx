'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@findeg/ui';
import { Button } from '@findeg/ui';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@findeg/ui';
import { ScrollArea } from '@findeg/ui';
import { Tag } from '@findeg/backend/features/catalog';
import { TagBadge } from '@components/shared/TagBadge';
import { cn } from '@lib/utils';

interface TagSelectProps {
  allTags: Tag[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Admin Tag Multi-Select
 *
 * Allows selecting multiple tags, organized by their group.
 */
export function TagSelect({
  allTags,
  selectedIds,
  onChange,
  placeholder = 'Select tags...',
  className,
}: TagSelectProps) {
  // Group tags by their 'group' field
  const groupedTags = React.useMemo(() => {
    const groups: Record<string, Tag[]> = {};
    allTags.forEach((tag) => {
      const groupName = tag.group || 'Other';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(tag);
    });
    return groups;
  }, [allTags]);

  const selectedTags = allTags.filter((tag) => selectedIds.includes(tag.id));

  /**
   *
   */
  const toggleTag = (tagId: number) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  /**
   *
   */
  const removeTag = (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== tagId));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-auto min-h-10 px-3 py-2"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} className="pr-1">
                    <button
                      type="button"
                      onClick={(e) => removeTag(tag.id, e)}
                      className="ml-1 rounded-full outline-none hover:bg-black/10 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </TagBadge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
          <ScrollArea className="h-72">
            {Object.entries(groupedTags).map(([groupName, tags], index) => (
              <React.Fragment key={groupName}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 py-1.5 px-2 mb-1">
                  {groupName}
                </DropdownMenuLabel>
                {tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedIds.includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {tag.key}
                  </DropdownMenuCheckboxItem>
                ))}
              </React.Fragment>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
