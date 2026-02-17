/**
 * Variant Snapshot — Preserves selected variant details at time of purchase.
 */

import { z } from "zod";

export const VariantSnapshotSchema = z.record(z.string(), z.unknown());

export type VariantSnapshot = z.infer<typeof VariantSnapshotSchema>;
