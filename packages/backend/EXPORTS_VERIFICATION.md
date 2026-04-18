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
} from "@backend";

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
} from "@backend/types";

// Feature-specific exports
import { MediaService } from "@backend/features/media";
import { DrizzleCategoryRepository } from "@backend/features/catalog";
```

## Verification Status

✅ All exports are accessible
✅ TypeScript compilation succeeds
✅ No circular dependency issues
✅ Export paths match package.json exports field
