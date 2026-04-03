"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { CustomerGroup, UomCode } from "@/features/core/domain/types/common";

const UOM_VALUES = ["pcs", "pack", "carton"] as const;
const CUSTOMER_GROUP_VALUES = ["public_b2c", "school_b2b", "wholesale"] as const;

export interface VariantPricingConfig {
  variantKey: string;
  uoms: {
    uomCode: string;
    factorToBase: number;
    isEnabled?: boolean;
  }[];
  prices: {
    customerGroup: string;
    uomCode: string;
    unitPrice: number;
    currency?: string;
    isSellable?: boolean;
  }[];
}

const DEFAULT_UOM = { uomCode: "pcs", factorToBase: 1, isEnabled: true };
const DEFAULT_PRICE = {
  customerGroup: "public_b2c",
  uomCode: "pcs",
  unitPrice: 0,
  currency: "EGP",
  isSellable: true,
};

interface ProductVariantsProps {
  configs: VariantPricingConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<VariantPricingConfig[]>>;
  loading: boolean;
}

/**
 *
 */
export function ProductVariants({ configs, setConfigs, loading }: ProductVariantsProps) {
  /**
   *
   */
  const updateVariantConfig = (
    index: number,
    updater: (config: VariantPricingConfig) => VariantPricingConfig,
  ) => {
    setConfigs((prev) => prev.map((item, i) => (i === index ? updater(item) : item)));
  };

  /**
   *
   */
  const addVariantConfig = () => {
    setConfigs((prev) => [
      ...prev,
      { variantKey: "default", uoms: [DEFAULT_UOM], prices: [DEFAULT_PRICE] },
    ]);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Variant Pricing & Sellable UoMs</h3>
          <p className="text-xs text-muted-foreground">
            Configure sellable units and per-customer-group prices without writing JSON.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={addVariantConfig}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant Config
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading variant pricing config...
        </div>
      )}

      {!loading && configs.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No variant pricing config yet. You can add one or keep default product pricing only.
        </div>
      )}

      {configs.map((config, configIndex) => (
        <div
          key={`${config.variantKey}-${configIndex}`}
          className="space-y-4 rounded-md border p-4 bg-muted/20"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label>Variant Key</Label>
              <Input
                value={config.variantKey}
                onChange={(e) =>
                  updateVariantConfig(configIndex, (item) => ({
                    ...item,
                    variantKey: e.target.value,
                  }))
                }
                placeholder="default"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfigs((prev) => prev.filter((_, i) => i !== configIndex))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Variant
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sellable UoMs</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  updateVariantConfig(configIndex, (item) => ({
                    ...item,
                    uoms: [...item.uoms, DEFAULT_UOM],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add UoM
              </Button>
            </div>
            {config.uoms.map((uom, uomIndex) => (
              <div key={`${configIndex}-uom-${uomIndex}`} className="grid gap-3 md:grid-cols-4">
                <Select
                  value={uom.uomCode}
                  onValueChange={(value) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      uoms: item.uoms.map((u, i) =>
                        i === uomIndex ? { ...u, uomCode: value as UomCode } : u,
                      ),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    {UOM_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={uom.factorToBase}
                  onChange={(e) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      uoms: item.uoms.map((u, i) =>
                        i === uomIndex ? { ...u, factorToBase: Number(e.target.value || 0) } : u,
                      ),
                    }))
                  }
                  placeholder="Factor to base"
                />
                <div className="flex items-center rounded-md border px-3">
                  <Checkbox
                    checked={uom.isEnabled ?? true}
                    onCheckedChange={(checked) =>
                      updateVariantConfig(configIndex, (item) => ({
                        ...item,
                        uoms: item.uoms.map((u, i) =>
                          i === uomIndex ? { ...u, isEnabled: checked === true } : u,
                        ),
                      }))
                    }
                  />
                  <span className="ml-2 text-sm">Enabled</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive h-10 px-3"
                  onClick={() =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      uoms: item.uoms.filter((_, i) => i !== uomIndex),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Price Lists</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  updateVariantConfig(configIndex, (item) => ({
                    ...item,
                    prices: [...item.prices, DEFAULT_PRICE],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add Price Row
              </Button>
            </div>
            {config.prices.map((price, priceIndex) => (
              <div key={`${configIndex}-price-${priceIndex}`} className="grid gap-3 md:grid-cols-6">
                <Select
                  value={price.customerGroup}
                  onValueChange={(value) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      prices: item.prices.map((p, i) =>
                        i === priceIndex ? { ...p, customerGroup: value as CustomerGroup } : p,
                      ),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Customer group" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_GROUP_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={price.uomCode}
                  onValueChange={(value) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      prices: item.prices.map((p, i) =>
                        i === priceIndex ? { ...p, uomCode: value as UomCode } : p,
                      ),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    {UOM_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price.unitPrice}
                  onChange={(e) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      prices: item.prices.map((p, i) =>
                        i === priceIndex ? { ...p, unitPrice: Number(e.target.value || 0) } : p,
                      ),
                    }))
                  }
                  placeholder="Unit price"
                />

                <Input
                  value={price.currency || "EGP"}
                  maxLength={3}
                  onChange={(e) =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      prices: item.prices.map((p, i) =>
                        i === priceIndex ? { ...p, currency: e.target.value.toUpperCase() } : p,
                      ),
                    }))
                  }
                  placeholder="EGP"
                />

                <div className="flex items-center rounded-md border px-3">
                  <Checkbox
                    checked={price.isSellable ?? true}
                    onCheckedChange={(checked) =>
                      updateVariantConfig(configIndex, (item) => ({
                        ...item,
                        prices: item.prices.map((p, i) =>
                          i === priceIndex ? { ...p, isSellable: checked === true } : p,
                        ),
                      }))
                    }
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Sellable</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive h-10 px-3"
                  onClick={() =>
                    updateVariantConfig(configIndex, (item) => ({
                      ...item,
                      prices: item.prices.filter((_, i) => i !== priceIndex),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
