'use client';

import React, { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Card, CardContent } from '@findeg/ui';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { ProductFormValues } from '@/interfaces';
import { Badge } from '@findeg/ui';
import { Switch } from '@findeg/ui';
import { cn } from '@lib/utils';

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

  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Auto-create a default variant if none exist (new product)
  useEffect(() => {
    if (fields.length === 0) {
      append({
        sku: '',
        localizedLabel: { en: 'Standard', ar: 'قياسي' },
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
      } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addVariant = () => {
    append({
      sku: '',
      localizedLabel: { en: '', ar: '' },
      basePrice: 0,
      costPrice: 0,
      isActive: true,
      isDefault: fields.length === 0,
      sortOrder: fields.length,
      barcode: '',
      images: [],
      attributes: [],
    } as any);
  };

  const setAsDefault = (index: number) => {
    fields.forEach((_, i) => {
      setValue(`variants.${i}.isDefault`, i === index);
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
          const variant = watch(`variants.${index}`);

          return (
            <Card
              key={field.id}
              className={cn(
                'overflow-hidden transition-all',
                isExpanded ? 'ring-1 ring-primary/20' : 'hover:bg-muted/30',
                variant.isDefault && 'border-primary/50 bg-primary/5'
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
                          <Badge variant="secondary" className="px-1 py-0 h-4 text-[10px] bg-primary/10 text-primary border-primary/20">
                            <Star className="h-2 w-2 mr-1 fill-current" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {variant.localizedLabel?.en || 'Unnamed'}
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
                        {variant.isActive ? 'Active' : 'Draft'}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums">
                        EGP {variant.basePrice?.toFixed(2) || '0.00'}
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
                      Set Default
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
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">{t('sku')}</FormLabel>
                              {variant.isDefault && (
                                <span className="text-[10px] text-primary font-medium flex items-center">
                                  <Star className="h-2.5 w-2.5 mr-1 fill-current" />
                                  Primary SKU for Product
                                </span>
                              )}
                            </div>
                            <FormControl>
                              <Input placeholder="e.g. STA-PEN-BLUE" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name={`variants.${index}.localizedLabel.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Label (EN)</FormLabel>
                              <FormControl>
                                <Input placeholder="Blue" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.localizedLabel.ar`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Label (AR)</FormLabel>
                              <FormControl>
                                <Input dir="rtl" placeholder="أزرق" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name={`variants.${index}.basePrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('basePrice')} (EGP)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.costPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Cost Price (EGP)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) =>
                                    field.onChange(
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Barcode</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="EAN/UPC..."
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`variants.${index}.weightGrams`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Weight (Grams)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <FormField
                      control={control}
                      name={`variants.${index}.isActive`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">
                            This variant is active and available for purchase
                          </FormLabel>
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
