/**
 * EnrichedTableRow Component
 *
 * Base row component for enriched table pattern.
 * Supports compact/expanded states with click-to-expand behavior.
 *
 * Location: src/app/[locale]/admin/_components/table/ (admin-wide)
 */

'use client';

import * as React from 'react';
import { TableRow, TableCell } from '@findeg/ui';
import { Checkbox } from '@findeg/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@lib/utils';

export interface EnrichedTableRowProps {
  /** Row ID for selection */
  id: string | number;
  /** Compact state content */
  compactContent: React.ReactNode;
  /** Expanded state content (shows below compact when expanded) */
  expandedContent?: React.ReactNode;
  /** Is row expanded */
  isExpanded?: boolean;
  /** Toggle expansion handler */
  onToggle?: () => void;
  /** Is row selected (checkbox) */
  isSelected?: boolean;
  /** Selection change handler */
  onSelectChange?: (selected: boolean) => void;
  /** Number of columns (for expanded content colspan) */
  columnCount?: number;
  /** Disable expansion */
  disableExpansion?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EnrichedTableRow — Base for compact/expandable rows
 *
 * Features:
 * - Click-to-expand behavior
 * - Optional checkbox selection
 * - Smooth expansion animation
 * - Expanded content in separate row
 *
 * @example
 * <EnrichedTableRow
 *   id={product.id}
 *   compactContent={<ProductCompact product={product} />}
 *   expandedContent={<ProductExpanded product={product} />}
 *   isExpanded={expandedId === product.id}
 *   onToggle={() => toggleExpand(product.id)}
 *   isSelected={selectedIds.includes(product.id)}
 *   onSelectChange={(sel) => handleSelect(product.id, sel)}
 * />
 */
export function EnrichedTableRow({
  id,
  compactContent,
  expandedContent,
  isExpanded = false,
  onToggle,
  isSelected = false,
  onSelectChange,
  columnCount = 6,
  disableExpansion = false,
  className,
}: EnrichedTableRowProps) {
  const canExpand = !disableExpansion && expandedContent && onToggle;

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on checkbox or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }

    if (canExpand) {
      onToggle();
    }
  };

  return (
    <>
      {/* Compact Row */}
      <TableRow
        className={cn(
          'group transition-colors',
          canExpand && 'cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/50',
          isExpanded && 'bg-muted/30 dark:bg-slate-800/30',
          className,
        )}
        onClick={handleRowClick}
      >
        {/* Checkbox */}
        {onSelectChange && (
          <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelectChange}
              aria-label={`Select row ${id}`}
            />
          </TableCell>
        )}

        {/* Expand/Collapse Icon */}
        {canExpand && (
          <TableCell className="w-12">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </TableCell>
        )}

        {/* Compact Content */}
        {compactContent}
      </TableRow>

      {/* Expanded Row */}
      {isExpanded && expandedContent && (
        <TableRow className="bg-muted/30 dark:bg-slate-800/30 hover:bg-muted/30 dark:hover:bg-slate-800/30">
          <TableCell colSpan={columnCount} className="py-4">
            <div className="animate-in fade-in-50 duration-200">{expandedContent}</div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
