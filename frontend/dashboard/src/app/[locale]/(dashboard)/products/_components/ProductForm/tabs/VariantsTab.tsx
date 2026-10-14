'use client';

import type { Locale } from '@findeg/domain';
import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  formatEgpDecimal,
  Input,
  Button,
  Card,
  CardContent,
  Badge,
  Switch,
} from '@findeg/ui';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { ProductFormValues } from '@/interfaces';
import { cn } from '@lib/utils';

/**
 * Sub-component for managing key-value attributes for a variant
 */
function VariantAttributesEditor({ variantIndex }: { variantIndex: number }) {
  const t = useTranslations('Administration.Catalog.Products.Form.Tabs.Variants');
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.attributes`,
  });

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('attributesTitle')}
          </h4>
          <p className="text-xs text-muted-foreground">{t('attributesDesc')}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => append({ attributeKey: '', value: '' })}
        >
          <Plus className="mr-1 h-3 w-3" />
          {t('addAttribute')}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t('noAttributes')}</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, attrIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={control}
                name={`variants.${variantIndex}.attributes.${attrIndex}.attributeKey`}
                render={({ field: inputField }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder={t('attributeKey')}
                        className="h-8 text-xs"
                        {...inputField}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
                render={({ field: inputField }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder={t('attributeValue')}
                        className="h-8 text-xs"
                        {...inputField}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(attrIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sub-component for managing image URLs for a variant
 */
function VariantImagesEditor({ variantIndex }: { variantIndex: number }) {
  const t = useTranslations('Administration.Catalog.Products.Form.Tabs.Variants');
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.images`,
  });
  const [newUrl, setNewUrl] = useState('');

  const handleAddImage = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      append({
        url: trimmed,
        alt: '',
        displayOrder: fields.length,
      });
      setNewUrl('');
    } catch {
      // Ignore invalid URL
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('imagesTitle')}
          </h4>
          <p className="text-xs text-muted-foreground">{t('imagesDesc')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder={t('imageUrl')}
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="h-8 text-xs flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddImage();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleAddImage}
          disabled={!newUrl.trim()}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {t('addImage')}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t('noImages')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
          {fields.map((field, imgIndex) => (
            <div
              key={field.id}
              className="group relative border rounded-md overflow-hidden aspect-square bg-muted/20 flex items-center justify-center"
            >
              <img
                src={field.url}
                alt={field.alt || `Variant image ${imgIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove(imgIndex)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Variants Management Tab
 */
export function VariantsTab() {
  const t = useTranslations('Administration.Catalog.Products.Form.Tabs.Variants');
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Auto-create a default variant if none exist (new product)
  useEffect(() => {
    if (fields.length === 0) {
      append({
        sku: '',
        localizedLabel: { en: 'Standard', ar: 'قياسي' } satisfies Record<
          Locale,
          string | undefined
        >,
        basePrice: 0,
        costPrice: 0,
        strikePrice: null,
        weightGrams: null,
        barcode: '',
        isActive: true,
        isDefault: true,
        sortOrder: 0,
        images: [],
        attributes: [],
      });
    }
  }, []);

  const addVariant = () => {
    append({
      sku: '',
      localizedLabel: { en: '', ar: '' } satisfies Record<Locale, string | undefined>,
      basePrice: 0,
      costPrice: null,
      strikePrice: null,
      weightGrams: null,
      isActive: true,
      isDefault: fields.length === 0,
      sortOrder: fields.length,
      barcode: '',
      images: [],
      attributes: [],
    });
  };

  const setAsDefault = (index: number) => {
    fields.forEach((_, i) => {
      setValue(`variants.${i}.isDefault`, i === index, { shouldDirty: true });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t('productVariants')}</h3>
            <p className="text-sm text-muted-foreground">{t('variantsDesc')}</p>
          </div>
        </div>
        <div className="flex justify-start">
          <Button size="sm" onClick={addVariant} variant="outline" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            {t('addVariant')}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const isExpanded = expandedIds.includes(field.id);
          const variant = watch(`variants.${index}`) || {};

          return (
            <Card
              key={field.id}
              className={cn(
                'overflow-hidden transition-all',
                isExpanded ? 'ring-1 ring-primary/20' : 'hover:bg-muted/30',
                variant.isDefault && 'border-primary/50 bg-primary/5',
              )}
            >
              {/* Collapsed Header / Summary */}
              <div
                className="flex items-center p-3 cursor-pointer select-none"
                onClick={() => toggleExpand(field.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100" />
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {variant.sku || 'New Variant'}
                        </span>
                        {variant.isDefault && (
                          <Badge
                            variant="secondary"
                            className="px-1 py-0 h-4 text-[10px] bg-primary/10 text-primary border-primary/20"
                          >
                            <Star className="h-2 w-2 mr-1 fill-current" />
                            {t('default')}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {variant.localizedLabel?.en || '—'}
                      </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 ml-auto">
                      <Badge
                        variant="outline"
                        className={cn(
                          variant.isActive
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300',
                        )}
                      >
                        {variant.isActive ? t('active') : t('inactive')}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums">
                        EGP{' '}
                        {formatEgpDecimal(
                          Number.isFinite(variant.basePrice)
                            ? Number(variant.basePrice).toFixed(2)
                            : '0.00',
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!variant.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsDefault(index);
                      }}
                    >
                      {t('setDefault')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <CardContent className="p-5 pt-2 border-t bg-muted/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Basic Variant Info */}
                    <div className="space-y-4">
                      <FormField
                        control={control}
                        name={`variants.${index}.sku`}
                        render={({ field: skuField }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">{t('sku')}</FormLabel>
                              {variant.isDefault && (
                                <span className="text-[10px] text-primary font-medium flex items-center">
                                  <Star className="h-2.5 w-2.5 mr-1 fill-current" />
                                  {t('primarySku')}
                                </span>
                              )}
                            </div>
                            <FormControl>
                              <Input placeholder="e.g. STA-PEN-BLUE" {...skuField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name={`variants.${index}.localizedLabel.en`}
                          render={({ field: labelEnField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('labelEn')}</FormLabel>
                              <FormControl>
                                <Input placeholder="Blue" {...labelEnField} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.localizedLabel.ar`}
                          render={({ field: labelArField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('labelAr')}</FormLabel>
                              <FormControl>
                                <Input dir="rtl" placeholder="أزرق" {...labelArField} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={control}
                          name={`variants.${index}.basePrice`}
                          render={({ field: priceField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('basePrice')} (EGP)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...priceField}
                                  value={priceField.value === 0 ? '' : (priceField.value ?? '')}
                                  onChange={(e) =>
                                    priceField.onChange(
                                      e.target.value === '' ? 0 : parseFloat(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.strikePrice`}
                          render={({ field: strikeField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('compareAtPrice')} (EGP)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...strikeField}
                                  value={strikeField.value ?? ''}
                                  onChange={(e) =>
                                    strikeField.onChange(
                                      e.target.value === '' ? null : parseFloat(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.costPrice`}
                          render={({ field: costField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('costPrice')} (EGP)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...costField}
                                  value={costField.value ?? ''}
                                  onChange={(e) =>
                                    costField.onChange(
                                      e.target.value === '' ? null : parseFloat(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name={`variants.${index}.barcode`}
                          render={({ field: barcodeField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('barcode')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="EAN/UPC..."
                                  {...barcodeField}
                                  value={barcodeField.value ?? ''}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.weightGrams`}
                          render={({ field: weightField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('weightGrams')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...weightField}
                                  value={weightField.value ?? ''}
                                  onChange={(e) =>
                                    weightField.onChange(
                                      e.target.value === '' ? null : parseInt(e.target.value, 10),
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attributes Editor */}
                  <VariantAttributesEditor variantIndex={index} />

                  {/* Variant Images Editor */}
                  <VariantImagesEditor variantIndex={index} />

                  {/* Status & Default variant controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t">
                    <FormField
                      control={control}
                      name={`variants.${index}.isActive`}
                      render={({ field: activeField }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={activeField.value}
                              onCheckedChange={activeField.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">
                            {t('variantActiveHelp')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`variants.${index}.isDefault`}
                      render={({ field: defaultField }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={defaultField.value}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAsDefault(index);
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">{t('default')}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
