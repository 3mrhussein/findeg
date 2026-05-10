/**
 * InfoTab — Product information tab for edit form
 *
 * Contains ProductInfoZone (name, description, category, brand)
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 */

'use client';

import * as React from 'react';
import { ProductInfoZone } from '../../../_components/ProductForm/zones/ProductInfoZone';

interface InfoTabProps {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
}

/**
 * InfoTab — Basic product information
 */
export function InfoTab({ categories, brands }: InfoTabProps) {
  return (
    <div className="space-y-6">
      <ProductInfoZone categories={categories} brands={brands} />
    </div>
  );
}
