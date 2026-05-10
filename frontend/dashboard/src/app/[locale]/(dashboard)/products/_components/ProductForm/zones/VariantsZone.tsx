'use client';

import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { Separator } from '@findeg/ui';
import { Switch } from '@findeg/ui';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@findeg/ui';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Layers3,
  AlertTriangle,
  Trash2,
  Settings2,
} from 'lucide-react';
import { PricingZone } from './PricingZone';
import { ProductStockSection } from './ProductStockSection';
import { UoMSection } from '../uom/UoMSection';
import { BilingualInput } from '@components/shared/BilingualInput';
import { generateVariantMatrix, Sku } from '@findeg/backend/features/catalog';
import { ProductFormValues } from '@/interfaces';

/**
 * VariantsZone — Zone 2
 *
 * Progressive disclosure:
 * 1. Collapsed state: shows "No variants — 1 default variant" info badge
 * 2. Expanded state: shows AttributeDimensionPicker + "Generate Matrix" button
 * 3. After generation: shows VariantCard list
 */
export function VariantsZone() {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dimensions, setDimensions] = React.useState<
    { key: string; options: string; label: string }[]
  >([]);
  const [newDimKey, setNewDimKey] = React.useState('');
  const [newDimOptions, setNewDimOptions] = React.useState('');

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    control: control as any,
    name: 'variants',
  });

  const variants = watch('variants') ?? [];
  const skuPrefix = watch('sku') ?? '';

  // ─── Matrix generation ──────────────────────────────────────────────────────

  /**
   *
   */
  function generateMatrix() {
    if (!dimensions.length) return;

    const dimsForMatrix = dimensions.map((d) => ({
      attributeKey: d.key,
      options: d.options
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    }));

    const combos = generateVariantMatrix(dimsForMatrix);

    combos.forEach((combo, i) => {
      const attrEntries = Object.entries(combo);
      const suggestedSku = Sku.suggestVariantSku(
        skuPrefix || 'SKU',
        attrEntries.map(([, v]) => v),
      );

      append({
        sku: suggestedSku,
        localizedLabel: { en: attrEntries.map(([, v]) => v).join(' / '), ar: '' },
        displayOrder: variants.length + i,
        isActive: true,
        basePrice: 0,
        strikePrice: null,
        costPrice: null,
        weightGrams: null,
        barcode: null,
        lowStockThreshold: 10,
        images: [],
        attributes: attrEntries.map(([k, v]) => ({
          attributeKey: k,
          value: v,
          isVariantDefining: true,
        })),
        uoms: [],
      } as any);
    });
  }

  /**
   *
   */
  function addDimension() {
    if (!newDimKey.trim() || !newDimOptions.trim()) return;
    setDimensions((prev) => [
      ...prev,
      {
        key: newDimKey.trim().toLowerCase().replace(/\s+/g, '_'),
        options: newDimOptions,
        label: newDimKey.trim(),
      },
    ]);
    setNewDimKey('');
    setNewDimOptions('');
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-left">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                  <Layers3 className="h-3.5 w-3.5" />
                  Variants
                </CardTitle>
                {variantFields.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {variantFields.length}
                  </Badge>
                )}
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {variantFields.length === 0 && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Simple product — a single default variant will be created automatically on save.
                  Add attribute dimensions below to build a variant matrix.
                </p>
              </div>
            )}

            {/* Dimension builder */}
            <div className="rounded-md border p-3 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Settings2 className="h-3 w-3" />
                Attribute Dimensions
              </Label>

              {dimensions.map((dim, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="font-mono">
                    {dim.key}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <span className="flex-1 text-muted-foreground">{dim.options}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setDimensions((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <Input
                  value={newDimKey}
                  onChange={(e) => setNewDimKey(e.target.value)}
                  placeholder="Attribute (e.g. color)"
                  className="h-7 text-xs"
                />
                <Input
                  value={newDimOptions}
                  onChange={(e) => setNewDimOptions(e.target.value)}
                  placeholder="Options comma-separated (blue, red, black)"
                  className="h-7 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addDimension}
                >
                  Add
                </Button>
              </div>

              {dimensions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={generateMatrix} className="h-7 text-xs" size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Generate{' '}
                    {
                      generateVariantMatrix(
                        dimensions.map((d) => ({
                          attributeKey: d.key,
                          options: d.options
                            .split(',')
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })),
                      ).length
                    }{' '}
                    Variants
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Combinations will be appended below
                  </span>
                </div>
              )}
            </div>

            {/* Variant cards */}
            {variantFields.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Variant Details
                </Label>

                {variantFields.map((field, index) => (
                  <VariantCard key={field.id} index={index} onRemove={() => remove(index)} />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── VariantCard ──────────────────────────────────────────────────────────────

interface VariantCardProps {
  index: number;
  onRemove: () => void;
}

/**
 *
 */
function VariantCard({ index, onRemove }: VariantCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(index === 0);
  const { watch, setValue } = useFormContext<ProductFormValues>();

  const sku = watch(`variants.${index}.sku`) ?? '';
  const isActive = watch(`variants.${index}.isActive`) ?? true;
  const attrs: { value: string }[] = watch(`variants.${index}.attributes`) ?? [];
  const displayLabel = attrs.length
    ? attrs.map((a) => a.value).join(' / ')
    : sku || `Variant ${index + 1}`;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-md border">
        {/* Card header */}
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted/50">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="flex-1 text-xs font-medium">{displayLabel}</span>
            <span className="font-mono text-xs text-muted-foreground">{sku}</span>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setValue(`variants.${index}.isActive`, v)}
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t px-3 pb-4 pt-4">
            {/* Variant label */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Display Label</Label>
              <BilingualInput
                nameEn={`variants.${index}.localizedLabel.en`}
                nameAr={`variants.${index}.localizedLabel.ar`}
                placeholderEn="e.g. Blue 0.7mm"
                placeholderAr="مثال: أزرق ٠.٧ مم"
              />
            </div>

            <Separator />

            {/* Stock section */}
            <ProductStockSection variantIndex={index} />

            <Separator />

            {/* Pricing */}
            <PricingZone variantIndex={index} />

            <Separator />

            {/* UoMs */}
            <UoMSection
              fieldArrayName={`variants.${index}.uoms`}
              title="Variant Units of Measure"
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
