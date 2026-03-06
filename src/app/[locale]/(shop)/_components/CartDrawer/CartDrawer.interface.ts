/**
 * CartDrawer — shared types & interfaces
 */

export interface CartDrawerItemType {
  variantId: number;
  productName: string;
  variantLabel: string;
  uomCode: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}
