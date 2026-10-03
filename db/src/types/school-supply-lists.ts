import { z } from 'zod';

/** Shared, transport-neutral input contracts for lifecycle services and persistence. */
export const SupplyListIdSchema = z.number().int().positive();
const translationSchema = z
  .object({ en: z.string().optional(), ar: z.string().optional() })
  .strict();
const labelSchema = translationSchema.refine((value) =>
  Boolean(value.en?.trim() || value.ar?.trim()),
);

const draftFields = {
  grade: z.string().trim().min(1).max(255),
  academicYear: z.string().trim().min(1).max(255),
  localizedTitle: labelSchema,
  localizedDescription: translationSchema.nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
};

export const CreateSupplyListDraftSchema = z
  .object({ businessPartnerId: SupplyListIdSchema, ...draftFields })
  .strict();
export const UpdateSupplyListDraftSchema = z.object(draftFields).partial().strict();
export const SupplyListItemSchema = z
  .object({
    /** A draft may be incomplete; publication requires an active default. */
    variantId: SupplyListIdSchema.nullable().optional(),
    exactItem: z.boolean().optional(),
    specification: z
      .object({ categoryId: SupplyListIdSchema, attributes: z.record(z.string(), z.string()) })
      .strict()
      .nullable()
      .optional(),
    required: z.boolean().optional(),
    quantity: z.number().int().min(1).max(999).optional(),
    localizedLabel: labelSchema,
    localizedNote: translationSchema.nullable().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .strict();

export type CreateSupplyListDraftInput = z.infer<typeof CreateSupplyListDraftSchema>;
export type UpdateSupplyListDraftInput = z.infer<typeof UpdateSupplyListDraftSchema>;
export type SupplyListItemInput = z.infer<typeof SupplyListItemSchema>;

/** Staff input for a List Offer: basis points 0 to 10000 and a window with `endsAt` after `startsAt`. */
export const ListOfferSchema = z
  .object({
    basisPoints: z.number().int().min(0).max(10000),
    startsAt: z.date(),
    endsAt: z.date().nullable(),
  })
  .strict()
  .refine((offer) => offer.endsAt === null || offer.endsAt > offer.startsAt);
export type ListOfferInput = z.infer<typeof ListOfferSchema>;
