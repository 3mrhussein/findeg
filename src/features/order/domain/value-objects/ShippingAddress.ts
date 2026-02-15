/**
 * Shipping Address — Egyptian address format.
 *
 * Stored as JSONB in orders to preserve the exact address at time of purchase.
 */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
}
