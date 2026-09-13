/**
 * BulkActionsBar Component
 *
 * Floating action bar that appears when table rows are selected.
 * Fixed bottom center position with slide-up animation.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@findeg/ui';
import { cn } from '@lib/utils';

export interface BulkAction {
  /** Unique action key */
  key: string;
  /** Action label */
  label: string;
  /** Action icon (Lucide component) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Action handler */
  onClick: () => void | Promise<void>;
  /** Button variant */
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
}

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Available bulk actions */
  actions: BulkAction[];
  /** Clear selection handler */
  onClear: () => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * BulkActionsBar — Floating selection action bar
 *
 * Shows at bottom center when items are selected.
 * Slides up on mount, down on unmount.
 *
 * @example
 * <BulkActionsBar
 *   selectedCount={5}
 *   actions={[
 *     { key: 'activate', label: 'Activate', onClick: handleActivate },
 *     { key: 'delete', label: 'Delete', onClick: handleDelete, variant: 'destructive' },
 *   ]}
 *   onClear={clearSelection}
 * />
 */
export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
  loading = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up-fade">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-6 py-3 shadow-lg">
        {/* Selection count */}
        <div className="flex items-center gap-2 border-e pe-4">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={loading || action.disabled}
              className="gap-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Clear button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={loading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
