/**
 * Cart Service Interface
 */

import { ID, Quantity, Price, CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import { CartItem } from "../../domain/entities/Cart";
import { Product } from "@/features/catalog/domain/entities/Product";
import { VariantSnapshot } from "@/features/order/domain/value-objects";

export interface ICartService {
  addToCart(
    items: CartItem[],
    product: Product,
    quantity: Quantity,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  removeFromCart(
    items: CartItem[],
    productId: ID,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  updateQuantity(
    items: CartItem[],
    productId: ID,
    quantity: Quantity,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  getTotals(items: CartItem[]): { totalItems: Quantity; totalPrice: Price };

  // Server-side/Managed methods (for API compatibility)
  getCart(cartId: string): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;
  addItem(
    cartId: string,
    input: {
      productId: ID;
      quantity: Quantity;
      name?: string;
      price?: Price;
      images?: string[];
      categoryName?: string;
      variant?: VariantSnapshot;
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
      unitPriceSnapshot?: Price;
      currency?: string;
    },
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;
  removeItem(
    cartId: string,
    itemId: ID,
    selectors?: {
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;
  updateItemQuantity(
    cartId: string,
    itemId: ID,
    quantity: Quantity,
    selectors?: {
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;
  clearCart(cartId: string): Promise<void>;
}
