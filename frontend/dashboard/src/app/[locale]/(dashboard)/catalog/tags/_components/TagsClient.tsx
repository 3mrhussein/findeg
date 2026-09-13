'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Tag } from '@findeg/backend/features/catalog';
import { Plus, Search, Filter, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { TagCard } from './TagCard';
import { TagDrawer } from './TagDrawer';
import {
  deleteTagAction as deleteTag,
  toggleTagStatusAction as toggleTagStatus,
  getTagProductCountAction as getTagProductCount,
} from '@data/tags/actions';
import { useToast } from '@hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@findeg/ui';
import { getTagDisplayName } from '@lib/tag-utils';

interface TagsClientProps {
  initialTags: Record<string, Tag[]>;
}

// Group ordering
const GROUP_ORDER = ['campaign', 'audience', 'quality'];

export function TagsClient({ initialTags }: TagsClientProps) {
  const t = useTranslations('Administration.Catalog.Tags');
  const locale = useLocale() as 'en' | 'ar';
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tagProductCount, setTagProductCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredGroups = useMemo(() => {
    const result: Record<string, Tag[]> = {};
    const query = searchQuery.toLowerCase();

    Object.entries(initialTags).forEach(([group, tags]) => {
      const filtered = tags.filter(
        (tag) =>
          tag.key.toLowerCase().includes(query) ||
          getTagDisplayName(tag.key, locale).toLowerCase().includes(query),
      );

      if (filtered.length > 0) {
        result[group] = filtered;
      }
    });

    // Sort keys based on GROUP_ORDER
    const sortedKeys = Object.keys(result).sort((a, b) => {
      const idxA = GROUP_ORDER.indexOf(a);
      const idxB = GROUP_ORDER.indexOf(b);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const sortedResult: Record<string, Tag[]> = {};
    sortedKeys.forEach((key) => {
      sortedResult[key] = result[key];
    });

    return sortedResult;
  }, [initialTags, searchQuery, locale]);

  const handleAdd = () => {
    setSelectedTag(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDrawerOpen(true);
  };

  const handleToggle = async (tag: Tag) => {
    const res = await toggleTagStatus(Number(tag.id));
    if (res.success) {
      toast({
        title: res.isActive ? t('ToastActivated') : t('ToastDeactivated'),
      });
    } else {
      toast({
        title: res.error || 'Error',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = async (tag: Tag) => {
    setTagToDelete(tag);
    const res = await getTagProductCount(Number(tag.id));
    if (res.success) {
      setTagProductCount(res.count || 0);
    }
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteTag(Number(tagToDelete.id));
      if (res.success) {
        toast({
          title: t('ToastDeleted'),
        });
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: res.error || 'Error',
          variant: 'destructive',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('Title')}</h2>
          <p className="text-muted-foreground">{t('Subtitle')}</p>
        </div>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {t('AddTag')}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('SearchPlaceholder')}
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl border-dashed">
          <Filter className="mr-2 h-4 w-4" /> {t('FilterGroup')}
        </Button>
      </div>

      <div className="space-y-12">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-lg font-semibold">{t('NoResults')}</h3>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([group, tags]) => (
            <div key={group} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group}
                </h3>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <TagDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} tag={selectedTag} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t('DeleteConfirmTitle', { key: tagToDelete?.key || '' })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2">
              {tagProductCount > 0
                ? t('DeleteConfirmWithProducts', { count: tagProductCount })
                : t('DeleteConfirmNoProducts')}
              <p className="mt-4 font-semibold text-foreground">{t('CannotUndo')}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('DeleteAnyway')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
