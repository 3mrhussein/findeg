/**
 * Domain Entity: Address
 *
 * Egyptian shipping address format.
 * Each user can have multiple saved addresses.
 */

export interface Address {
  id: number;
  userId: number;
  /** User-defined label (e.g., "Home", "Office") */
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  /** Whether this is the user's default address */
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
