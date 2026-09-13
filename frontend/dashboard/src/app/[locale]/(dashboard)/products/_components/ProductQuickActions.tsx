/**
 * ProductQuickActions — Quick action buttons for product row
 * Max 4 actions, no destructive actions (delete should be in bulk actions or detail page)
 */

'use client';

import { Button } from '@findeg/ui';
import { Edit, Copy, Eye, FileStack } from 'lucide-react';
import { Link } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';

interface ProductQuickActionsProps {
  productId: number;
  productName: string;
  sku?: string;
}

export function ProductQuickActions({ productId, productName, sku }: ProductQuickActionsProps) {
  const { toast } = useToast();

  const handleCopySKU = () => {
    if (!sku) return;
    navigator.clipboard.writeText(sku);
    toast({
      title: 'SKU copied',
      description: `${sku} copied to clipboard`,
    });
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate logic (server action)
    toast({
      title: 'Duplicate product',
      description: 'This feature will be available soon',
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/products/${productId}/edit`}>
          <Edit className="h-4 w-4 me-1" />
          Edit
        </Link>
      </Button>

      {/* Duplicate */}
      <Button variant="outline" size="sm" onClick={handleDuplicate}>
        <FileStack className="h-4 w-4 me-1" />
        Duplicate
      </Button>

      {/* Preview (storefront link) */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/products/${productId}`} target="_blank">
          <Eye className="h-4 w-4 me-1" />
          Preview
        </Link>
      </Button>

      {/* Copy SKU */}
      {sku && (
        <Button variant="outline" size="sm" onClick={handleCopySKU}>
          <Copy className="h-4 w-4 me-1" />
          Copy SKU
        </Button>
      )}
    </div>
  );
}
