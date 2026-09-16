// Client-safe entry point for the order feature's Zod schemas/types.
//
// Unlike './index.ts' (the feature's main barrel), this module has no import
// path to './application/services/factory' or 'db/src/connection.ts', so it
// is safe to import from Client Components. It only re-exports DTO
// schemas/types used for form validation — never services or the service
// factory. See docs/adr/0001-backend-feature-barrels.md.

export {
  ShippingAddressSchema,
  type ShippingAddress,
} from './domain/value-objects/ShippingAddress';
export {
  VariantSnapshotSchema,
  type VariantSnapshot,
} from './domain/value-objects/VariantSnapshot';
export {
  OrderStatusUpdateSchema,
  type OrderStatusUpdate,
} from './application/dtos/OrderStatusUpdate';
