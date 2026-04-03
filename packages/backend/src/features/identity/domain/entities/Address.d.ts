/**
 * Domain Entity: Address
 *
 * Egyptian shipping address format.
 * Each user can have multiple saved addresses.
 */
export interface Address {
    /** Unique ID for the address record */
    id: number;
    /** Owning user's ID */
    userId: number;
    /** Friendly label for the address (e.g., "Home", "Office") */
    label: string;
    /** Recipient's full name */
    fullName: string;
    /** Contact phone number for delivery */
    phone: string;
    /** City or Governorate name */
    city: string;
    /** Specific area or neighborhood */
    area: string;
    /** Street name or number */
    street: string;
    /** Building name, number, or landmark */
    building?: string;
    /** Floor number within the building */
    floor?: string;
    /** Apartment number or identifier */
    apartment?: string;
    /** Internal delivery instructions or landmark details */
    notes?: string;
    /** Flag identifying the primary shipping location for the user */
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
