"use client";

import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Package2 } from "lucide-react";
import { PREDEFINED_UOMS } from "@/features/catalog/domain/types/UoMTypes";
import { CUSTOMER_GROUPS } from "@/features/catalog/domain/types/UoMTypes";
import { PriceInput } from "../shared/PriceInput";
import { BilingualInput } from "../shared/BilingualInput";
import type { ProductFormValues } from "../types";
import { cn } from "@/lib/utils";

interface UoMSectionProps {
  /** Path prefix in form — e.g. "sharedUoMs" or "variants.0.uoms" */
  fieldArrayName: string;
  title?: string;
}

/**
 * UoMSection
 *
 * Manages a list of UoM rows. Each row has:
 * - UoM code dropdown (predefined + custom)
 * - Factor to base quantity
 * - Localized label (EN/AR)
 * - Optional barcode
 * - Expandable price list rows (per customer group)
 */
export function UoMSection({ fieldArrayName, title = "Units of Measure" }: UoMSectionProps) {
  const { control, register, watch, setValue } = useFormContext<ProductFormValues>();
  const [expandedRows, setExpandedRows] = React.useState<Record<number, boolean>>({});
  const [customUomIndex, setCustomUomIndex] = React.useState<number | null>(null);

  // Dynamic field array for UoMs — we use raw path for useFieldArray

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: fieldArrayName as any,
  });

  /**
   *
   */
  function addPredefinedUoM(code: string) {
    const def = PREDEFINED_UOMS.find((u) => u.code === code);
    if (!def) return;
    append({
      uomCode: def.code,
      factorToBase: def.factorToBase,
      localizedLabel: def.label,
      barcode: "",
      isEnabled: true,
      priceLists: [],
    } as any);
  }

  /**
   *
   */
  function addCustomUoM() {
    const idx = fields.length;
    append({
      uomCode: "",
      factorToBase: 1,
      localizedLabel: { en: "", ar: "" },
      barcode: "",
      isEnabled: true,
      priceLists: [],
    } as any);
    setCustomUomIndex(idx);
    setExpandedRows((prev) => ({ ...prev, [idx]: true }));
  }

  /**
   *
   */
  function toggleRow(index: number) {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  /**
   *
   */
  function addPriceListRow(uomIndex: number) {
    const current = (watch(fieldArrayName as any) as any[])[uomIndex]?.priceLists ?? [];

    setValue(`${fieldArrayName}.${uomIndex}.priceLists` as any, [
      ...current,
      {
        customerGroup: "public_b2c",
        uomCode: fields[uomIndex] ? (fields[uomIndex] as Record<string, unknown>).uomCode : "",
        unitPrice: 0,
        minQty: 1,
        isSellable: true,
      },
    ]);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <Package2 className="h-3.5 w-3.5" />
            {title}
          </CardTitle>
          <div className="flex gap-1.5">
            <Select onValueChange={addPredefinedUoM}>
              <SelectTrigger className="h-7 w-auto gap-1 text-xs">
                <Plus className="h-3 w-3" />
                <SelectValue placeholder="Add UoM" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_UOMS.map((u) => (
                  <SelectItem key={u.code} value={u.code} className="text-xs">
                    {u.label.en} (×{u.factorToBase})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={addCustomUoM}
            >
              <Plus className="h-3 w-3 mr-1" />
              Custom
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No units defined. Add a predefined UoM or define a custom one.
          </p>
        )}

        {fields.map((field, index) => {
          const isExpanded = expandedRows[index];
          const uomCode = (field as Record<string, unknown>).uomCode as string;
          const factor = (field as Record<string, unknown>).factorToBase as number;

          const priceLists = ((watch(fieldArrayName as any) as any[])[index]?.priceLists ??
            []) as unknown[];

          return (
            <div key={field.id} className="rounded-md border">
              {/* Row header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggleRow(index)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="font-mono text-xs font-semibold uppercase">
                    {uomCode || "NEW"}
                  </span>
                  <span className="text-xs text-muted-foreground">×{factor}</span>
                  {priceLists.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                      {priceLists.length} price{priceLists.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </button>
                <Switch
                  checked={(field as Record<string, unknown>).isEnabled as boolean}
                  onCheckedChange={(v) =>
                    setValue(`${fieldArrayName}.${index}.isEnabled` as any, v)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>

              {/* Expanded row */}
              {isExpanded && (
                <div className="space-y-3 border-t px-3 pb-3 pt-3">
                  {/* Code + factor */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Code</Label>
                      <Input
                        {...register(`${fieldArrayName}.${index}.uomCode` as any)}
                        placeholder="e.g. box"
                        className="h-7 font-mono text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Factor to Base
                      </Label>
                      <Input
                        {...register(`${fieldArrayName}.${index}.factorToBase` as any, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="12"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Barcode</Label>
                      <Input
                        {...register(`${fieldArrayName}.${index}.barcode` as any)}
                        placeholder="Optional"
                        className="h-7 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Localized label */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Label</Label>
                    <BilingualInput
                      nameEn={`${fieldArrayName}.${index}.localizedLabel.en`}
                      nameAr={`${fieldArrayName}.${index}.localizedLabel.ar`}
                      placeholderEn="Box of 12"
                      placeholderAr="علبة ١٢"
                    />
                  </div>

                  <Separator />

                  {/* Price list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Price Lists
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => addPriceListRow(index)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add row
                      </Button>
                    </div>

                    {priceLists.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-2">
                        No price rows. Add a row to set customer-group-specific prices.
                      </p>
                    )}

                    {/* Price list headers */}
                    {priceLists.length > 0 && (
                      <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 px-1 pb-1">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Customer Group
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Unit Price
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Min Qty
                        </span>
                        <span />
                      </div>
                    )}

                    {priceLists.map((_: unknown, plIdx: number) => (
                      <div
                        key={plIdx}
                        className="grid grid-cols-[1fr_80px_80px_40px] items-center gap-2"
                      >
                        <Select
                          value={
                            (watch(
                              `${fieldArrayName}.${index}.priceLists.${plIdx}.customerGroup` as any,
                            ) as string) || "public_b2c"
                          }
                          onValueChange={(v) =>
                            setValue(
                              `${fieldArrayName}.${index}.priceLists.${plIdx}.customerGroup` as any,
                              v,
                            )
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUSTOMER_GROUPS.map((g) => (
                              <SelectItem key={g.code} value={g.code} className="text-xs">
                                {g.label.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-1.5 top-[50%] -translate-y-1/2 text-[9px] text-muted-foreground">
                            EGP
                          </span>
                          <Input
                            {...register(
                              `${fieldArrayName}.${index}.priceLists.${plIdx}.unitPrice` as any,
                              { valueAsNumber: true },
                            )}
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-7 pl-8 text-xs"
                          />
                        </div>
                        <Input
                          {...register(
                            `${fieldArrayName}.${index}.priceLists.${plIdx}.minQty` as any,
                            { valueAsNumber: true },
                          )}
                          type="number"
                          min="1"
                          step="1"
                          className="h-7 text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            const current = [
                              ...((watch(fieldArrayName as any) as any[])[index]?.priceLists ?? []),
                            ];
                            current.splice(plIdx, 1);

                            setValue(`${fieldArrayName}.${index}.priceLists` as any, current);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
