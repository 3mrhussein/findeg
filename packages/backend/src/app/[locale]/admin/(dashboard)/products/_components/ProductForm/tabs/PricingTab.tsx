"use client";

import React, { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, DollarSign, Ruler } from "lucide-react";
import { type ProductFormValues } from "@/features/administration/presentation/forms/product-form";

/**
 * Pricing & Units of Measure Tab
 * Two sections: Price Lists (top) and Units of Measure (bottom)
 */
export function PricingTab() {
  const t = useTranslations("Administration.Catalog.Products.Form.Tabs.Pricing");
  const { control, watch } = useFormContext<ProductFormValues>();

  // Manage UoMs for the first variant
  const {
    fields: uomFields,
    append: appendUom,
    remove: removeUom,
  } = useFieldArray({
    control,
    name: "variants.0.uoms",
  });

  // Manage Price Lists nested under the first UoM
  const {
    fields: priceListFields,
    append: appendPriceList,
    remove: removePriceList,
  } = useFieldArray({
    control,
    name: "variants.0.uoms.0.priceLists",
  });

  // Watch UoMs to use as select options in Price Lists
  const uoms = watch("variants.0.uoms") || [];

  return (
    <div className="space-y-6">
      {/* ─── PRICE LISTS ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Price Lists
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define pricing tiers for different customer groups and units of measure.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() =>
              appendPriceList({
                customerGroup: "public_b2c",
                uomCode: uoms[0]?.uomCode || "pcs",
                unitPrice: 0,
                minQty: 1,
                isSellable: true,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add price tier
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Customer Group</TableHead>
                <TableHead className="w-[110px]">UoM</TableHead>
                <TableHead className="w-[140px]">Unit Price (EGP)</TableHead>
                <TableHead className="w-[100px]">Min Qty</TableHead>
                <TableHead className="w-[80px]">Sellable</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceListFields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic">
                    No price tiers defined. Add a tier to set pricing.
                  </TableCell>
                </TableRow>
              ) : (
                priceListFields.map((pl, index) => (
                  <TableRow key={pl.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`variants.0.uoms.0.priceLists.${index}.customerGroup`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public_b2c">Public (B2C)</SelectItem>
                              <SelectItem value="school_b2b">School (B2B)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`variants.0.uoms.0.priceLists.${index}.uomCode`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-9 text-xs font-mono">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {uoms.map((u) => (
                                <SelectItem key={u.uomCode} value={u.uomCode}>
                                  {u.uomCode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`variants.0.uoms.0.priceLists.${index}.unitPrice`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            className="h-9 text-xs"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))
                            }
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`variants.0.uoms.0.priceLists.${index}.minQty`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            className="h-9 text-xs"
                            placeholder="1"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? 1 : parseInt(e.target.value))
                            }
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`variants.0.uoms.0.priceLists.${index}.isSellable`}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removePriceList(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ─── UNITS OF MEASURE ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              Units of Measure
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define sellable units (e.g. Piece, Pack of 3, Box of 12).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() =>
              appendUom({
                uomCode: "",
                factorToBase: 1,
                localizedLabel: { en: "", ar: "" },
                isEnabled: true,
                priceLists: [],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add UoM
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>Label (AR)</TableHead>
                <TableHead className="w-[90px] text-right">Factor</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uomFields.map((uom, index) => (
                <TableRow key={uom.id}>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`variants.0.uoms.${index}.uomCode`}
                      render={({ field }) => (
                        <Input className="h-9 text-xs font-mono" placeholder="pcs" {...field} />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`variants.0.uoms.${index}.localizedLabel.en`}
                      render={({ field }) => (
                        <Input className="h-9 text-xs" placeholder="Piece" {...field} />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`variants.0.uoms.${index}.localizedLabel.ar`}
                      render={({ field }) => (
                        <Input
                          className="h-9 text-xs text-right"
                          dir="rtl"
                          placeholder="قطعة"
                          {...field}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`variants.0.uoms.${index}.factorToBase`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          className="h-9 text-xs text-right font-mono"
                          placeholder="1"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? 1 : parseInt(e.target.value))
                          }
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeUom(index)}
                      disabled={index === 0 && uomFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
