'use client';
import { useActionError } from '@hooks/use-action-error';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  Checkbox,
} from '@findeg/ui';
import {
  addItemAction,
  updateItemAction,
  getCategoryOptionsAction,
  type ActionState,
} from '../_actions/lists';

export interface ItemFormValues {
  id?: number;
  labelEn: string;
  labelAr: string;
  quantity: number;
  required: boolean;
  exactItem: boolean;
  variantId: number | null;
  categoryId: number | null;
  attributes: Record<string, string>;
  noteEn: string;
  noteAr: string;
}

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: number;
  categories: Array<{ id: number; name: string }>;
  item: ItemFormValues | null;
}

export function ItemDialog({ open, onOpenChange, listId, categories, item }: ItemDialogProps) {
  const t = useTranslations('SchoolLists');
  const actionError = useActionError('SchoolLists.Errors');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [labelEn, setLabelEn] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [required, setRequired] = useState(true);
  const [exactItem, setExactItem] = useState(true);
  const [variantId, setVariantId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [noteEn, setNoteEn] = useState('');
  const [noteAr, setNoteAr] = useState('');

  const [availableAttributes, setAvailableAttributes] = useState<
    Array<{ attributeKey: string; values: string[] }>
  >([]);

  useEffect(() => {
    if (item) {
      setLabelEn(item.labelEn || '');
      setLabelAr(item.labelAr || '');
      setQuantity(String(item.quantity || 1));
      setRequired(item.required);
      setExactItem(item.exactItem);
      setVariantId(item.variantId ? String(item.variantId) : '');
      setCategoryId(item.categoryId ? String(item.categoryId) : '');
      setAttributes(item.attributes || {});
      setNoteEn(item.noteEn || '');
      setNoteAr(item.noteAr || '');
    } else {
      setLabelEn('');
      setLabelAr('');
      setQuantity('1');
      setRequired(true);
      setExactItem(true);
      setVariantId('');
      setCategoryId('');
      setAttributes({});
      setNoteEn('');
      setNoteAr('');
    }
    setError(null);
  }, [item, open]);

  useEffect(() => {
    if (!exactItem && categoryId) {
      const catId = Number(categoryId);
      if (catId > 0) {
        getCategoryOptionsAction(catId).then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setAvailableAttributes(res.data);
          } else {
            setAvailableAttributes([]);
          }
        });
      }
    } else {
      setAvailableAttributes([]);
    }
  }, [exactItem, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('labelEn', labelEn);
    formData.set('labelAr', labelAr);
    formData.set('quantity', String(quantity));
    formData.set('required', required ? 'true' : 'false');
    formData.set('exactItem', exactItem ? 'true' : 'false');
    if (variantId.trim()) {
      formData.set('variantId', variantId.trim());
    }
    if (!exactItem && categoryId.trim()) {
      formData.set('categoryId', categoryId.trim());
      formData.set('attributes', JSON.stringify(attributes));
    }
    formData.set('noteEn', noteEn);
    formData.set('noteAr', noteAr);

    startTransition(async () => {
      let result: ActionState;
      if (item?.id) {
        result = await updateItemAction(listId, item.id, { status: 'idle' }, formData);
      } else {
        result = await addItemAction(listId, { status: 'idle' }, formData);
      }

      if (result.status === 'error') {
        setError(result.message || 'unknown');
      } else {
        onOpenChange(false);
      }
    });
  };

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="item-dialog">
        <DialogHeader>
          <DialogTitle>{item ? t('EditItem') : t('AddItem')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
              data-testid="item-error-alert"
            >
              {actionError(error ?? undefined)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="item-label-en">{t('LabelEn')}</Label>
              <Input
                id="item-label-en"
                value={labelEn}
                onChange={(e) => setLabelEn(e.target.value)}
                dir="ltr"
                data-testid="item-label-en"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-label-ar">{t('LabelAr')}</Label>
              <Input
                id="item-label-ar"
                value={labelAr}
                onChange={(e) => setLabelAr(e.target.value)}
                dir="rtl"
                data-testid="item-label-ar"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="item-quantity">{t('Quantity')}</Label>
              <Input
                id="item-quantity"
                type="number"
                min="1"
                max="999"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                data-testid="item-quantity"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="item-required"
                checked={required}
                onCheckedChange={(c) => setRequired(Boolean(c))}
                data-testid="item-required"
              />
              <Label htmlFor="item-required">{t('Required')}</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('ItemType')}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={exactItem}
                  onChange={() => setExactItem(true)}
                  data-testid="item-type-exact"
                />
                <span className="text-sm">{t('ExactItem')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={!exactItem}
                  onChange={() => setExactItem(false)}
                  data-testid="item-type-spec"
                />
                <span className="text-sm">{t('SpecificationItem')}</span>
              </label>
            </div>
          </div>

          {!exactItem && (
            <div className="space-y-3 rounded-md border p-3 bg-muted/20">
              <div className="space-y-1">
                <Label htmlFor="item-category">{t('Category')}</Label>
                <select
                  id="item-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setAttributes({});
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="item-category-select"
                >
                  <option value="">{t('SelectCategory')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableAttributes.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('Attributes')}</Label>
                  <div className="space-y-2">
                    {availableAttributes.map((attr) => (
                      <div key={attr.attributeKey} className="flex items-center gap-2">
                        <span className="w-24 text-xs font-medium text-muted-foreground">
                          {attr.attributeKey}
                        </span>
                        <select
                          value={attributes[attr.attributeKey] ?? ''}
                          onChange={(e) => handleAttributeChange(attr.attributeKey, e.target.value)}
                          className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                          data-testid={`attr-select-${attr.attributeKey}`}
                        >
                          <option value="">—</option>
                          {attr.values.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="item-variant-id">{t('DefaultVariant')}</Label>
            <Input
              id="item-variant-id"
              type="number"
              placeholder={t('DefaultVariant')}
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              data-testid="item-variant-id"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="item-note-en">{t('NoteEn')}</Label>
              <Textarea
                id="item-note-en"
                value={noteEn}
                onChange={(e) => setNoteEn(e.target.value)}
                dir="ltr"
                data-testid="item-note-en"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-note-ar">{t('NoteAr')}</Label>
              <Textarea
                id="item-note-ar"
                value={noteAr}
                onChange={(e) => setNoteAr(e.target.value)}
                dir="rtl"
                data-testid="item-note-ar"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="dialog-cancel-btn"
            >
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={isPending} data-testid="dialog-save-btn">
              {t('Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
