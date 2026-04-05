/**
 * UoM Domain Types
 *
 * Defines the known UoM codes and their default configurations.
 * The PREDEFINED_UOMS list powers the admin dropdown.
 */

export type UoMCode = string; // open string — admin can define custom codes

export interface UoMDefinition {
  code: UoMCode;
  factorToBase: number;
  label: { en: string; ar: string };
  /** Whether this is a system-predefined UoM (shown in dropdown) or custom */
  isPredefined: boolean;
}

/** The predefined UoM options shown in the admin dropdown */
export const PREDEFINED_UOMS: UoMDefinition[] = [
  {
    code: "pcs",
    factorToBase: 1,
    label: { en: "Piece", ar: "قطعة" },
    isPredefined: true,
  },
  {
    code: "pack",
    factorToBase: 12,
    label: { en: "Pack of 12", ar: "علبة ١٢" },
    isPredefined: true,
  },
  {
    code: "box",
    factorToBase: 6,
    label: { en: "Box of 6", ar: "صندوق ٦" },
    isPredefined: true,
  },
  {
    code: "dozen",
    factorToBase: 12,
    label: { en: "Dozen", ar: "دستة" },
    isPredefined: true,
  },
  {
    code: "carton",
    factorToBase: 144,
    label: { en: "Carton", ar: "كرتون" },
    isPredefined: true,
  },
];

export type CustomerGroup = "public_b2c" | "school_b2b";

export const CUSTOMER_GROUPS: { code: CustomerGroup; label: { en: string; ar: string } }[] = [
  { code: "public_b2c", label: { en: "Public (B2C)", ar: "عام" } },
  { code: "school_b2b", label: { en: "Schools (B2B)", ar: "مدارس" } },
];
