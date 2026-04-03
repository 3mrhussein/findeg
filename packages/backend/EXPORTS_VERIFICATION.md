# Backend Package Verification Test

This test file verifies that all exported modules can be imported correctly from the backend package.

## Test: Import all public exports

```typescript
// Main exports
import {
  // Core features
  ISessionProvider,

  // Repository contracts
  IUserRepository,
  IProductRepository,
  ICategoryRepository,
  IOrderRepository,

  // Auth & Identity
  JWTService,
  AuthService,

  // Error classes
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,

  // i18n utilities
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
} from "@findeg/backend";

// Validation schemas
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateProductSchema,
  UpdateProductSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderStatusSchema,
} from "@findeg/backend/types";

// Feature-specific exports
import { MediaService } from "@findeg/backend/features/media";
import { DrizzleCategoryRepository } from "@findeg/backend/features/catalog";
```

## Verification Status

✅ All exports are accessible
✅ TypeScript compilation succeeds
✅ No circular dependency issues
✅ Export paths match package.json exports field
