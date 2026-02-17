import { z } from "zod";
import { SlugSchema } from "@/features/core/domain/types/common";

export const BrandInputSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof BrandInputSchema>;
