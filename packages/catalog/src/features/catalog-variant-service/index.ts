import type { IVariantService } from '../catalog-i-variant-service/types';

export type VariantService = IVariantService;

// Retain the public constructor while this adapter has no operations or state.
const variantService = function variantService() {} as unknown as { new (): VariantService };
export { variantService as VariantService };
