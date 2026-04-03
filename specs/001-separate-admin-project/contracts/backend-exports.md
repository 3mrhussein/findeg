# Backend Package Exports Contract

**Package**: `@findeg/backend`  
**Version**: 1.0.0  
**Purpose**: Define all public exports from the backend package that dashboard and storefront packages can import

---

## Package Entry Points

```typescript
// packages/backend/package.json exports
{
  "exports": {
    ".": "./dist/index.js",
    "./features/core": "./dist/features/core/index.js",
    "./features/identity": "./dist/features/identity/index.js",
    "./features/media": "./dist/features/media/index.js",
    "./lib": "./dist/lib/index.js",
    "./types": "./dist/types/index.js"
  }
}
```

---

## Authentication & Authorization Contract

**Import Path**: `@findeg/backend/features/identity`

### Interfaces

```typescript
export interface IAuthService {
  /**
   * Generate JWT access and refresh tokens for a user
   * @param userId - Unique user identifier
   * @param roles - User roles for authorization
   * @returns Token pair with access and refresh tokens
   */
  generateTokens(userId: string, roles: string[]): Promise<TokenPair>;
  
  /**
   * Verify and decode a JWT token
   * @param token - JWT token string
   * @returns Decoded payload if valid
   * @throws {UnauthorizedError} if token is invalid or expired
   */
  verifyToken(token: string): Promise<JWTPayload>;
  
  /**
   * Refresh access token using refresh token
   * @param refreshToken - Valid refresh token
   * @returns New token pair
   * @throws {UnauthorizedError} if refresh token is invalid
   */
  refreshTokens(refreshToken: string): Promise<TokenPair>;
  
  /**
   * Revoke a token (logout)
   * @param token - Token to revoke
   */
  revokeToken(token: string): Promise<void>;
}

export interface IPermissionService {
  /**
   * Check if user has specific permission
   * @param userId - User to check
   * @param permission - Permission string (e.g., 'products:create')
   * @returns True if user has permission
   */
  hasPermission(userId: string, permission: string): Promise<boolean>;
  
  /**
   * Check if user has specific role
   * @param userId - User to check
   * @param role - Role string (e.g., 'admin', 'customer')
   * @returns True if user has role
   */
  hasRole(userId: string, role: string): Promise<boolean>;
}
```

### Types

```typescript
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
};

export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number; // issued at (Unix timestamp)
  exp: number; // expires at (Unix timestamp)
};
```

### Helper Functions

```typescript
/**
 * Assert that user is authenticated, throw if not
 * Usage in Server Actions: const user = await getAuthenticatedUser(cookies);
 */
export async function getAuthenticatedUser(cookies: ReadonlyRequestCookies): Promise<User>;

/**
 * Assert that user has specific permission, throw if not
 * Usage: await requirePermission(userId, 'products:delete');
 */
export async function requirePermission(userId: string, permission: string): Promise<void>;

/**
 * Assert that user has specific role, throw if not
 * Usage: await requireRole(userId, 'admin');
 */
export async function requireRole(userId: string, role: string): Promise<void>;
```

---

## Repository Contracts

**Import Path**: `@findeg/backend/features/core`

### IUserRepository

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters: UserFilters): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  count(filters?: UserFilters): Promise<number>;
}

export type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserFilters = {
  roles?: string[];
  isActive?: boolean;
  search?: string; // search by name or email
  limit?: number;
  offset?: number;
};

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  roles?: string[];
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'email'>>;
```

### IProductRepository

```typescript
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<Product[]>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  count(filters?: ProductFilters): Promise<number>;
}

export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  brandId: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: string[]; // Array of image URLs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductFilters = {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string; // search by name or SKU
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;
```

### ICategoryRepository

```typescript
export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findMany(filters?: CategoryFilters): Promise<Category[]>;
  findTree(): Promise<CategoryTree[]>; // Hierarchical category structure
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}

export type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTree = Category & {
  children: CategoryTree[];
};

export type CategoryFilters = {
  parentId?: string | null;
  isActive?: boolean;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
```

### IOrderRepository

```typescript
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, filters?: OrderFilters): Promise<Order[]>;
  findMany(filters: OrderFilters): Promise<Order[]>;
  create(data: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  count(filters?: OrderFilters): Promise<number>;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string; // Snapshot at order time
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Address = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
};

export type OrderFilters = {
  userId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
};

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
```

---

## Validation Schemas Contract

**Import Path**: `@findeg/backend/types`

All repository inputs have corresponding Zod schemas for validation:

```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roles: z.array(z.string()).optional(),
});

export const CreateProductSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid().nullable().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  sku: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

export const CreateCategorySchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, 'Order must have at least one item'),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(10),
    addressLine1: z.string().min(1),
    addressLine2: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().nullable().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z.object({
    // ... same as shippingAddress
  }),
  paymentMethod: z.enum(['cash', 'card', 'wallet']),
  notes: z.string().max(500).nullable().optional(),
});
```

---

## i18n & Localization Contract

**Import Path**: `@findeg/backend/lib/i18n`

```typescript
export type SupportedLocale = 'en' | 'ar';

/**
 * Get all translation messages for a locale
 * @param locale - Locale code ('en' or 'ar')
 * @returns Translation messages object
 */
export async function getMessages(locale: SupportedLocale): Promise<Messages>;

/**
 * Format currency for display
 * @param amount - Amount in base currency
 * @param locale - Display locale
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale: SupportedLocale): string;

/**
 * Format date for display
 * @param date - Date to format
 * @param locale - Display locale
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date, 
  locale: SupportedLocale, 
  format?: 'short' | 'medium' | 'long'
): string;

export type Messages = {
  [namespace: string]: string | Messages;
};
```

---

## Error Handling Contract

**Import Path**: `@findeg/backend/lib/errors`

```typescript
/**
 * Base error class for all backend errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 401 Unauthorized - User is not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

/**
 * 403 Forbidden - User lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * 400 Bad Request - Validation failed
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}
```

---

## Usage Examples

### Dashboard: Server Action with Validation

```typescript
// packages/dashboard/src/app/[locale]/admin/products/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { 
  getProductRepository,
  CreateProductSchema,
  type CreateProductInput,
  getAuthenticatedUser,
  requirePermission
} from '@findeg/backend';
import { cookies } from 'next/headers';

export async function createProduct(data: CreateProductInput) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(cookies());
  
  // 2. Check permissions
  await requirePermission(user.id, 'products:create');
  
  // 3. Validate input
  const validated = CreateProductSchema.parse(data);
  
  // 4. Create product via repository
  const productRepo = await getProductRepository();
  const product = await productRepo.create(validated);
  
  // 5. Revalidate cache
  revalidatePath('/[locale]/admin/products', 'page');
  
  return { success: true, product };
}
```

### Storefront: Server Component Data Fetching

```typescript
// packages/storefront/src/app/[locale]/(storefront)/products/[slug]/page.tsx
import { getProductRepository, getMessages, formatCurrency } from '@findeg/backend';
import { notFound } from 'next/navigation';

type Props = {
  params: { locale: 'en' | 'ar'; slug: string };
};

export default async function ProductPage({ params }: Props) {
  // 1. Fetch product
  const productRepo = await getProductRepository();
  const product = await productRepo.findBySlug(params.slug);
  
  if (!product || !product.isActive) {
    notFound();
  }
  
  // 2. Get translations
  const t = await getMessages(params.locale);
  
  // 3. Render
  return (
    <div>
      <h1>{params.locale === 'en' ? product.nameEn : product.nameAr}</h1>
      <p className="text-2xl font-bold">
        {formatCurrency(product.price, params.locale)}
      </p>
      <p>{params.locale === 'en' ? product.descriptionEn : product.descriptionAr}</p>
    </div>
  );
}
```

---

## Contract Stability Guarantees

### Semantic Versioning

Backend package follows semver:
- **MAJOR**: Breaking changes to exported interfaces (requires frontend updates)
- **MINOR**: New exports added (backward compatible)
- **PATCH**: Bug fixes, internal changes (no API changes)

### Deprecation Policy

- Deprecated exports must remain for at least 1 major version
- Deprecation warnings logged to console in development
- Migration guide provided for breaking changes

### Type Safety

- All exports fully typed with TypeScript
- No `any` types in public interfaces
- Zod schemas validate runtime data at boundaries

---

**Contract Version**: 1.0.0  
**Last Updated**: 2026-04-03  
**Status**: Draft (to be finalized during implementation)
