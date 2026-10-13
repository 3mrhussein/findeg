'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, Button } from '@findeg/ui';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Send } from 'lucide-react';
import { ItemDialog, type ItemFormValues } from './ItemDialog';
import { removeItemAction, reorderItemsAction, publishListAction } from '../_actions/lists';

export interface DisplayItem {
  id: number;
  listId: number;
  sortOrder: number;
  quantity: number;
  required: boolean;
  exactItem: boolean;
  variantId: number | null;
  specification: {
    categoryId: number;
    attributes: Record<string, string>;
  } | null;
  localizedLabel: { en?: string; ar?: string };
  localizedNote: { en?: string; ar?: string } | null;
}

interface ItemsEditorProps {
  listId: number;
  status: string;
  partnerStatus: string;
  canEdit: boolean;
  items: DisplayItem[];
  categories: Array<{ id: number; name: string }>;
  locale: string;
}

export function ItemsEditor({
  listId,
  status,
  partnerStatus,
  canEdit,
  items,
  categories,
  locale,
}: ItemsEditorProps) {
  const t = useTranslations('SchoolLists');
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemFormValues | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEditable = canEdit && status === 'draft' && partnerStatus !== 'closed';

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: DisplayItem) => {
    setEditingItem({
      id: item.id,
      labelEn: item.localizedLabel?.en || '',
      labelAr: item.localizedLabel?.ar || '',
      quantity: item.quantity,
      required: item.required,
      exactItem: item.exactItem,
      variantId: item.variantId,
      categoryId: item.specification?.categoryId || null,
      attributes: item.specification?.attributes || {},
      noteEn: item.localizedNote?.en || '',
      noteAr: item.localizedNote?.ar || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (itemId: number) => {
    setActionError(null);
    startTransition(async () => {
      const res = await removeItemAction(listId, itemId);
      if (res.status === 'error') {
        setActionError(res.message || 'Error deleting item');
      }
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    setActionError(null);
    startTransition(async () => {
      const res = await reorderItemsAction(
        listId,
        newItems.map((i) => i.id),
      );
      if (res.status === 'error') {
        setActionError(res.message || 'Error reordering items');
      }
    });
  };

  const [warnings, setWarnings] = useState<
    Array<{ code: string; listItemId: number; variantId: number }>
  >([]);

  const handlePublish = () => {
    setActionError(null);
    setWarnings([]);
    startTransition(async () => {
      try {
        const res = await publishListAction(listId);
        if (res.status === 'error') {
          setActionError(res.message || 'Error publishing list');
        } else if (res.status === 'success') {
          if (res.data?.warnings && res.data.warnings.length > 0) {
            setWarnings(res.data.warnings);
          }
        }
      } catch (err) {
        console.error('handlePublish client error:', err);
        setActionError(err instanceof Error ? err.message : 'Error publishing list');
      }
    });
  };

  return (
    <section
      className="space-y-4"
      data-testid="items-editor-section"
      data-hydrated={mounted ? 'true' : 'false'}
    >
      {warnings.length > 0 && (
        <div
          className="rounded-md bg-amber-500/15 p-4 text-sm text-amber-800 dark:text-amber-200"
          data-testid="out-of-stock-warning"
        >
          {t('OutOfStockWarning')}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{t('ItemsSection')}</h2>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAdd}
                disabled={!mounted || isPending}
                data-testid="add-item-btn"
              >
                <Plus className="me-1 h-4 w-4" />
                {t('AddItem')}
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!mounted || isPending}
                data-testid="publish-list-btn"
              >
                <Send className="me-1 h-4 w-4" />
                {isPending ? t('Publishing') : t('Publish')}
              </Button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div
          className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
          data-testid="editor-error-alert"
        >
          {actionError}
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
          data-testid="empty-items-notice"
        >
          {t('NoItems')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <table className="min-w-full divide-y divide-border" data-testid="items-table">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  {t('LabelEn')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  {t('Quantity')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  {t('ItemType')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  {t('DefaultVariant')}
                </th>
                {isEditable && (
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-muted-foreground" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => {
                const label =
                  (locale === 'ar' ? item.localizedLabel?.ar : item.localizedLabel?.en) ||
                  item.localizedLabel?.en ||
                  item.localizedLabel?.ar ||
                  '—';

                return (
                  <tr key={item.id} data-testid="item-row" data-item-id={item.id}>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>{label}</span>
                        {item.required ? (
                          <Badge variant="default" className="text-xs">
                            {t('Required')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t('Optional')}
                          </Badge>
                        )}
                      </div>
                      {(item.localizedNote?.en || item.localizedNote?.ar) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.localizedNote.en || item.localizedNote.ar}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {item.exactItem ? t('ExactItem') : t('SpecificationItem')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {item.variantId ? (
                        <span>#{item.variantId}</span>
                      ) : (
                        <span className="text-destructive text-xs">{t('NoVariant')}</span>
                      )}
                    </td>
                    {isEditable && (
                      <td className="px-4 py-3 text-end text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === 0 || isPending}
                            onClick={() => handleMove(index, 'up')}
                            data-testid={`move-up-${item.id}`}
                            title={t('MoveUp')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === items.length - 1 || isPending}
                            onClick={() => handleMove(index, 'down')}
                            data-testid={`move-down-${item.id}`}
                            title={t('MoveDown')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(item)}
                            disabled={isPending}
                            data-testid={`edit-item-${item.id}`}
                            title={t('EditItem')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={isPending}
                            data-testid={`delete-item-${item.id}`}
                            title={t('DeleteItem')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listId={listId}
        categories={categories}
        item={editingItem}
      />
    </section>
  );
}
