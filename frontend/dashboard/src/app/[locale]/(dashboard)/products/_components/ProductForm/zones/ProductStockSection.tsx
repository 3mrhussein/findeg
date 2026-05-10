'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Separator } from '@findeg/ui';
import { SkuInput } from '../shared/SkuInput';
import { WeightInput } from '../shared/WeightInput';
import { ProductFormValues } from '@/interfaces';

interface ProductStockSectionProps {
  variantIndex?: number;
  excludeVariantId?: number;
}

/**
 * ProductStockSection
 *
 * Covers: SKU, barcode, weight, low-stock threshold.
 * Works both at product level (simple products) and per-variant.
 * Uses string literals for field names to avoid template literal type issues.
 */
export function ProductStockSection({ variantIndex, excludeVariantId }: ProductStockSectionProps) {
  const { register } = useFormContext<ProductFormValues>();

  const isVariant = variantIndex !== undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {isVariant ? 'Variant Stock & Identity' : 'Stock & Identity'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* SKU */}
          {isVariant ? (
            <SkuInput
              name={`variants.${variantIndex}.sku`}
              label="SKU"
              required
              excludeVariantId={excludeVariantId}
              hint="Uppercase, letters, digits, hyphens only"
            />
          ) : (
            <SkuInput
              name="sku"
              label="Product SKU Prefix"
              excludeVariantId={excludeVariantId}
              hint="Used to suggest variant SKUs"
            />
          )}

          {/* Barcode */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Barcode (EAN/UPC)</Label>
            {isVariant ? (
              <Input
                {...register(`variants.${variantIndex}.barcode`)}
                placeholder="e.g. 6221023456789"
                className="h-8 font-mono text-sm"
              />
            ) : (
              <Input placeholder="Optional" className="h-8 font-mono text-sm" disabled />
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          {/* Weight */}
          {isVariant ? (
            <WeightInput name={`variants.${variantIndex}.weightGrams`} label="Weight" />
          ) : (
            <WeightInput name="sharedBasePrice" label="Weight (N/A for SPU)" />
          )}

          {/* Low stock threshold */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Low Stock Alert</Label>
            <div className="relative flex items-center">
              {isVariant ? (
                <Input
                  {...register(`variants.${variantIndex}.lowStockThreshold`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  placeholder="10"
                  className="h-8 pr-10 text-sm"
                />
              ) : (
                <Input
                  type="number"
                  min="0"
                  placeholder="10"
                  disabled
                  className="h-8 pr-10 text-sm"
                />
              )}
              <span className="pointer-events-none absolute right-2 text-xs text-muted-foreground">
                units
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
