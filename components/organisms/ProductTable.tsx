import React from 'react';
import type { Product } from '../../types';
import { useTranslation } from '../../hooks';
import { Button } from '../ui/button';
import { Icon } from '../atoms/Icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface ProductTableUIProps {
    products: Product[];
    t: (key: string) => string;
    getStock: (product: Product) => number;
}

export const ProductTableUI: React.FC<ProductTableUIProps> = ({ products, t, getStock }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t('table_header_product_name')}</TableHead>
                <TableHead>{t('table_header_category')}</TableHead>
                <TableHead>{t('table_header_price')}</TableHead>
                <TableHead>{t('table_header_stock')}</TableHead>
                <TableHead>{t('table_header_actions')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {products.map(product => (
                <TableRow key={product.id}>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{getStock(product)}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`}><Icon name="pen" className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" aria-label={`Delete ${product.name}`}><Icon name="trash" className="w-4 h-4" /></Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


interface ProductTableProps {
    products: Product[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
    const { t } = useTranslation();
    const getStock = (product: Product) => {
        if (!product.variants) return 10; // Mock stock for non-variant products
        return Object.values(product.variants).flatMap(v => v.options).reduce((sum, opt) => sum + opt.stock, 0);
    }
    return <ProductTableUI products={products} t={t} getStock={getStock} />;
};
