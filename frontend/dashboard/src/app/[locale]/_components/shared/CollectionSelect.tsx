/**
 * CollectionSelect Component
 *
 * Multi-select dropdown for product collections.
 * Searchable with checkbox list.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@findeg/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Checkbox } from '@findeg/ui';
import { cn } from '@lib/utils';

export interface Collection {
  id: number;
  name: string;
  nameAr?: string;
}

export interface CollectionSelectProps {
  /** Available collections */
  collections: Collection[];
  /** Selected collection IDs */
  selectedIds: number[];
  /** Change handler */
  onChange: (selectedIds: number[]) => void;
  /** Current locale */
  locale?: 'en' | 'ar';
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CollectionSelect — Multi-select collection picker
 *
 * @example
 * <CollectionSelect
 *   collections={allCollections}
 *   selectedIds={product.collectionIds}
 *   onChange={setCollectionIds}
 *   locale="en"
 * />
 */
export function CollectionSelect({
  collections,
  selectedIds,
  onChange,
  locale = 'en',
  placeholder = 'Select collections...',
  className,
}: CollectionSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const toggleCollection = (collectionId: number) => {
    const updated = selectedIds.includes(collectionId)
      ? selectedIds.filter((id) => id !== collectionId)
      : [...selectedIds, collectionId];
    onChange(updated);
  };

  const selectedCollections = collections.filter((c) => selectedIds.includes(c.id));

  const getCollectionName = (collection: Collection) => {
    return locale === 'ar' && collection.nameAr ? collection.nameAr : collection.name;
  };

  const filteredCollections = collections.filter((c) => {
    const name = getCollectionName(c).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedCollections.length === 0
                ? placeholder
                : `${selectedCollections.length} selected`}
            </span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <Input
              type="search"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-64 overflow-auto border-t">
            {filteredCollections.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No collections found
              </div>
            ) : (
              filteredCollections.map((collection) => {
                const isSelected = selectedIds.includes(collection.id);
                return (
                  <div
                    key={collection.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <Checkbox checked={isSelected} />
                    <span className="flex-1 text-sm">{getCollectionName(collection)}</span>
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selectedCollections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCollections.map((collection) => (
            <Badge key={collection.id} variant="secondary" className="gap-1">
              {getCollectionName(collection)}
              <button
                type="button"
                onClick={() => toggleCollection(collection.id)}
                className="ms-1 rounded-full hover:bg-black/10"
              >
                <span className="sr-only">Remove</span>
                <span aria-hidden>×</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
