"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryBatchControlsProps {
  selectedCount: number;
  selectedVisibleCount: number;
  batchDelta: number;
  batchSaving: boolean;
  onBatchDeltaChange: (value: number) => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

/**
 * Batch adjustment panel — quantity input + increase / decrease buttons.
 */
export function InventoryBatchControls({
  selectedCount,
  selectedVisibleCount,
  batchDelta,
  batchSaving,
  onBatchDeltaChange,
  onIncrease,
  onDecrease,
}: InventoryBatchControlsProps) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-sm font-medium">Batch adjustment</p>
      <p className="text-xs text-muted-foreground mt-1">
        {selectedCount} selected ({selectedVisibleCount} visible)
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Input
          type="number"
          min={1}
          value={batchDelta}
          onChange={(e) => onBatchDeltaChange(Math.max(1, Number(e.target.value) || 1))}
          className="h-8 w-24"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={batchSaving || selectedCount === 0}
          onClick={onIncrease}
        >
          Increase
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={batchSaving || selectedCount === 0}
          onClick={onDecrease}
        >
          Decrease
        </Button>
      </div>
    </div>
  );
}
