import {
  addToCart as domainAddToCart,
  cart as domainCart,
  removeFromCart as domainRemoveFromCart,
  setCartQuantity as domainSetCartQuantity,
  type Cart as DomainCart,
  type VariantId,
} from '@findeg/domain';

export const CART_STORAGE_KEY = 'findeg:cart';
export const CART_META_STORAGE_KEY = 'findeg:cart-meta';

export interface StoredCartLine {
  variantId: number;
  quantity: number;
}

export interface StoredCart {
  v: 1;
  lines: StoredCartLine[];
}

export interface CartStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ItemMetadata {
  productId?: number;
  productName?: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice?: number;
  sku?: string;
}

export type MetadataMap = Record<string, ItemMetadata>;

export interface ClientCartItem extends ItemMetadata {
  variantId: number;
  quantity: number;
  currency: string;
}

const isStoredLine = (value: unknown): value is StoredCartLine => {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    Number.isInteger(line.variantId) &&
    Number.isInteger(line.quantity) &&
    (line.quantity as number) >= 1 &&
    (line.quantity as number) <= 999
  );
};

export function parseStoredCart(raw: string | null): StoredCart {
  if (!raw) return { v: 1, lines: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { v: 1, lines: [] };
    const { v, lines } = parsed as { v?: unknown; lines?: unknown };
    if (v !== 1 || !Array.isArray(lines) || !lines.every(isStoredLine)) {
      return { v: 1, lines: [] };
    }
    // Reconcile and merge duplicate variants through Domain Cart rules
    const domain = domainCart(
      lines.map((l) => ({ variantId: l.variantId as unknown as VariantId, quantity: l.quantity })),
    );
    return {
      v: 1,
      lines: domain.lines.map((l) => ({
        variantId: l.variantId as unknown as number,
        quantity: l.quantity,
      })),
    };
  } catch {
    return { v: 1, lines: [] };
  }
}

export function loadStoredCart(storage: CartStorage): StoredCart {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    return parseStoredCart(raw);
  } catch {
    return { v: 1, lines: [] };
  }
}

export function saveStoredCart(cart: StoredCart, storage: CartStorage): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable or quota exceeded; continues in memory for session
  }
}

export function loadMetadataMap(storage: CartStorage): MetadataMap {
  try {
    const raw = storage.getItem(CART_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as MetadataMap;
  } catch {
    return {};
  }
}

export function saveMetadataMap(meta: MetadataMap, storage: CartStorage): void {
  try {
    storage.setItem(CART_META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // Storage unavailable
  }
}

export function clearCartStorage(storage: CartStorage): void {
  try {
    storage.removeItem(CART_STORAGE_KEY);
    storage.removeItem(CART_META_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

function toDomain(cart: StoredCart): DomainCart {
  return {
    lines: cart.lines.map((l) => ({
      variantId: l.variantId as unknown as VariantId,
      quantity: l.quantity,
    })),
  };
}

function fromDomain(domain: DomainCart): StoredCart {
  return {
    v: 1,
    lines: domain.lines.map((l) => ({
      variantId: l.variantId as unknown as number,
      quantity: l.quantity,
    })),
  };
}

export function addLine(
  cart: StoredCart,
  line: StoredCartLine,
  meta?: ItemMetadata,
  metaMap: MetadataMap = {},
): { cart: StoredCart; metaMap: MetadataMap } {
  const current = toDomain(cart);
  const updated = domainAddToCart(current, {
    variantId: line.variantId as unknown as VariantId,
    quantity: line.quantity,
  });
  const nextCart = fromDomain(updated);
  const nextMeta = { ...metaMap };
  if (meta) {
    nextMeta[String(line.variantId)] = { ...meta };
  }
  return { cart: nextCart, metaMap: nextMeta };
}

export function updateLineQuantity(
  cart: StoredCart,
  variantId: number,
  quantity: number,
): StoredCart {
  if (quantity <= 0) return removeLine(cart, variantId);
  const current = toDomain(cart);
  const updated = domainSetCartQuantity(
    current,
    variantId as unknown as VariantId,
    Math.min(999, Math.max(1, Math.trunc(quantity))),
  );
  return fromDomain(updated);
}

export function removeLine(cart: StoredCart, variantId: number): StoredCart {
  const current = toDomain(cart);
  const updated = domainRemoveFromCart(current, variantId as unknown as VariantId);
  return fromDomain(updated);
}

export function toClientCartItems(cart: StoredCart, metaMap: MetadataMap = {}): ClientCartItem[] {
  return cart.lines.map((line) => {
    const meta = metaMap[String(line.variantId)] || {};
    return {
      variantId: line.variantId,
      quantity: line.quantity,
      productId: meta.productId,
      productName: meta.productName || `Item #${line.variantId}`,
      variantLabel: meta.variantLabel,
      imageUrl: meta.imageUrl,
      unitPrice: meta.unitPrice ?? 0,
      sku: meta.sku,
      currency: 'EGP',
    };
  });
}
