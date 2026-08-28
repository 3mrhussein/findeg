# Backend Infrastructure Layer Analysis: Business Logic Leakage

**Date**: May 11, 2026  
**Scope**: Repositories & persistence layer across all features  
**Objective**: Identify where business logic inappropriately resides in infrastructure vs. application/domain layers

---

## Executive Summary

The backend infrastructure layer contains **significant business logic leakage** across multiple features. Repositories are performing composition, orchestration, and complex transformations that should belong to application services or domain entities. This violates Clean Architecture principles where:

- **Domain**: Pure business rules & entities (no framework, no DB)
- **Application**: Use cases, services, orchestration (no DB access directly)
- **Infrastructure**: Persistence adapters, database queries, external service calls

**Current State**: 🔴 Repositories are doing application-layer work  
**Critical Issues**: 6 patterns identified with concrete examples  

---

## PATTERN 1: Repositories Performing Multi-Query Orchestration 🔴

**Issue**: Repositories internally orchestrate multiple database queries instead of exposing primitive operations. Services then become thin pass-throughs.

### Example 1: DrizzleProductRepository.getById()

**File**: [backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts#L113)

```typescript
// ❌ BAD: Repository does all the hydration
async getById(id: number, language?: Locale): Promise<Product | null> {
  const lang = parse(language);
  
  // Query 1: Get product with brand & category
  const results = await this.db.select({ product: products, brand: brands, category: categories })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);

  if (results.length === 0) return null;
  
  // Query 2: Get variants (calls private helper with separate query)
  const variants = await this.getHydratedVariants([id], lang);
  
  // Query 3: Get tags (separate query)
  const tagsData = await this.getProductTags(id, lang);
  
  // Query 4: Get attributes (separate query)
  const attrs = await this.getProductAttributes(id, lang);

  // Then maps to domain with complex localization logic
  return this.mapToDomain(results[0].product, variants[id], catName, ...);
}

// ✅ CORRECT: Repository exposes primitives, service orchestrates
class ProductRepository {
  async getById(id: number) {
    // Single responsibility: fetch from DB, return raw data
    return await db.query.products.findOne({ where: { id } });
  }
}

class ProductService {
  async getFullProduct(id: number, locale: string) {
    // Service coordinates the queries
    const product = await this.repo.getById(id);
    if (!product) return null;
    
    const [variants, tags, attrs] = await Promise.all([
      this.variantRepo.getByProductId(id),
      this.tagRepo.getByProductId(id),
      this.attributeRepo.getByProductId(id),
    ]);
    
    // Orchestrate assembly
    return this.assembleProduct(product, variants, tags, attrs, locale);
  }
}
```

**Why It's Wrong**:
- Repository method `getById()` executes 4 separate database queries internally
- Callers can't choose to fetch just the product without variants (coupling)
- Testing the repository requires mocking 4 different data access paths
- If another service needs only variants, it must call `getById()` then extract them

### Example 2: DrizzleProductRepository.getAll()

```typescript
// ❌ BAD: Gets all products then calls getById() for each one (N+1 pattern)
async getAll(language?: Locale): Promise<Product[]> {
  const lang = parse(language);
  const results = await this.db.select({ product: products, brand: brands, category: categories })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId));

  if (results.length === 0) return [];
  
  const productIds = results.map((r) => r.product.id);
  const variantsMap = await this.getHydratedVariants(productIds, lang); // Separate query for ALL variants

  // Iterates and maps each product
  return results.map((row) => {
    return this.mapToDomain(
      row.product,
      variantsMap[row.product.id] || [],
      catName,
      pick(asTranslationMap(row.brand?.localizedName ?? {}), lang),
      [],
      [],
      lang,
      defaultVariant
    );
  });
}
```

**Why It's Wrong**:
- Fetches variants for ALL products in a single query, then filters in-memory
- At scale (1000s of products), this loads unnecessary data
- No pagination support
- Transforms data (JSON parsing, locale picking) in the repository

### Example 3: DrizzleOrderRepository.getAllFiltered()

```typescript
// ❌ BAD: Repository fetches items for EACH order separately
async getAllFiltered(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
  // ... build WHERE clause ...
  
  const data = await db.select().from(orders).leftJoin(users, ...).limit(50);

  return {
    orders: await Promise.all(
      data.map(async (row) => {
        // Query executed PER order (N+1)
        const items = await db.select().from(orderItems)
          .where(eq(orderItems.orderId, row.order.id));

        // Complex mapping logic in repository
        const name = ((row.user ? [...].join(' ') : ...) || 'Guest');
        return this.mapToDomain(row.order, items, name, ...);
      }),
    ),
    total: totalResult[0]?.count || 0,
  };
}
```

**Issues**:
- **N+1 query pattern**: Fetches 50 orders, then executes 50 separate queries for items
- **Complex domain mapping** (customerName fallback logic) belongs in service/domain
- **Repository method is async generator** but doesn't optimize batch loading

---

## PATTERN 2: Repositories with Complex Business Logic 🔴

### Example 1: DrizzleSchoolListRepository.matchVariants()

**File**: [backend/src/features/catalog/infrastructure/persistence/DrizzleSchoolListRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleSchoolListRepository.ts#L174)

```typescript
// ❌ BAD: Business logic for attribute-based matching in repository
async matchVariants(matchRules: MatchRulesDraft): Promise<Variant[]> {
  const conditions = [];

  // Category matching rule
  if (matchRules.categoryId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM products WHERE products.id = ${productVariants.productId} 
          AND products.category_id = ${matchRules.categoryId})`
    );
  }

  // Brand matching rule
  if (matchRules.brandIds && matchRules.brandIds.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM products WHERE products.id = ${productVariants.productId} 
          AND products.brand_id IN ${matchRules.brandIds})`
    );
  }

  // Tag matching rule
  if (matchRules.tags && matchRules.tags.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM product_tags JOIN tags ...)`
    );
  }

  // Attribute matching logic (dynamic intersection)
  if (matchRules.attributes) {
    for (const [key, value] of Object.entries(matchRules.attributes)) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM variant_attributes 
            WHERE ... AND attribute_definitions.key = ${key} 
            AND variant_attributes.value_text = ${String(value)})`
      );
    }
  }

  // Then calls another repository to hydrate variants
  const variants = await Promise.all(results.map((r) => this.variantRepo.getById(r.id)));
}
```

**Why It's Wrong**:
- **Business rule**: "Match variants by category, brand, tags, AND attributes" is domain logic
- **Repository responsibility**: Persist and query variants, not interpret matching rules
- **Testability**: Can't test matching logic without a database
- **Reusability**: Business rule is buried in persistence layer

**Where It Should Be**:
```typescript
// In domain/value-objects or application service
class VariantMatcher {
  match(variants: Variant[], rules: MatchRulesDraft): Variant[] {
    return variants.filter(v => 
      (!rules.categoryId || v.product.categoryId === rules.categoryId) &&
      (!rules.brandIds?.length || rules.brandIds.includes(v.product.brandId)) &&
      (!rules.tags?.length || v.tags.some(t => rules.tags.includes(t.name))) &&
      this.matchesAllAttributes(v, rules.attributes)
    );
  }
}

// In SchoolListService (application layer)
async getMatchedVariants(rules: MatchRulesDraft): Promise<Variant[]> {
  // Repository just returns the candidates
  const candidates = await this.variantRepo.getByCategoryAndBrands(
    rules.categoryId, 
    rules.brandIds
  );
  
  // Service/domain does the matching
  return this.matcher.match(candidates, rules);
}
```

### Example 2: DrizzleInventoryRepository.reserveStock()

```typescript
// ⚠️ BORDERLINE: Business logic for stock reservation
async reserveStock(
  variantId: ID,
  warehouseId: ID,
  quantity: number,
  orderId: string,
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    // Check availability (business rule: can we reserve?)
    const [balance] = await tx.select().from(inventoryBalances)
      .where(and(...))
      .for('update');

    const available = (balance?.onHand || 0) - (balance?.reserved || 0);
    if (available < quantity) return false;  // ← Business rule

    // Update reservation
    await tx.insert(inventoryBalances).values({...})
      .onConflictDoUpdate({...});

    // Record movement (audit trail)
    await tx.insert(stockMovements).values({...});

    return true;
  });
}
```

**Assessment**:
- ✅ **Correct**: Wraps state change in transaction
- ✅ **Correct**: Uses pessimistic locking (.for('update'))
- ❌ **Leakage**: Business rule "available = onHand - reserved" & validation should be in service/domain
- ⚠️ **Borderline**: This is acceptable if repository stays at "persistence primitive" level, but validation should bubble up to service for clearer intent

---

## PATTERN 3: Repository-to-Repository Coupling (Anti-DI Pattern) 🔴

### Issue: Repositories Creating Other Repositories Directly

**Files Affected**:
- [backend/src/features/catalog/infrastructure/persistence/DrizzleSchoolListRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleSchoolListRepository.ts#L28)
- [backend/src/features/catalog/infrastructure/persistence/DrizzleInventoryRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleInventoryRepository.ts#L19)

```typescript
// ❌ BAD: Repository instantiates another repository
export class DrizzleSchoolListRepository implements ISchoolListRepository {
  private variantRepo = new DrizzleVariantRepository();  // ← Direct instantiation!

  async getItemsWithAlternatives(listId: ID): Promise<SchoolListItemResult[]> {
    // ...
    const variants = await Promise.all(variantIds.map((id) => this.variantRepo.getById(id)));
    // ...
  }
}
```

```typescript
// ❌ BAD: Same pattern in inventory
export class DrizzleInventoryRepository implements IInventoryRepository {
  private variantRepo = new DrizzleVariantRepository();  // ← Direct instantiation!

  async getLowStock(threshold?: number): Promise<LowStockResult[]> {
    // ...
  }
}
```

**Why It's Wrong**:
- **Breaks Dependency Injection**: Repository couples itself to concrete implementation
- **Violates Liskov Substitution Principle**: Can't swap variant repo implementation for testing
- **Unmaintainable**: Changes to `DrizzleVariantRepository` constructor affect all callers
- **Violates package boundaries**: Infrastructure layer shouldn't know about other repositories

**How It Should Be**:

```typescript
// ✅ CORRECT: Dependency injection
export class DrizzleSchoolListRepository implements ISchoolListRepository {
  constructor(private variantRepo: IVariantRepository) {}  // Injected

  async getItemsWithAlternatives(listId: ID): Promise<SchoolListItemResult[]> {
    // ...
    const variants = await Promise.all(variantIds.map((id) => this.variantRepo.getById(id)));
    // ...
  }
}

// In ServiceContainer:
get schoolListRepository(): ISchoolListRepository {
  return new DrizzleSchoolListRepository(this.variantRepository);  // Wire it up
}
```

---

## PATTERN 4: Data Transformation in Repository Instead of Domain/DTO Layer 🔴

### Example: Complex Localization Logic in Repository

**File**: [backend/src/features/catalog/infrastructure/persistence/DrizzleCategoryRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleCategoryRepository.ts#L40)

```typescript
// ❌ BAD: Repository does JSON parsing & locale selection
private mapToDomain(
  dbCategory: DbCategory,
  language: Locale = DEFAULT_LOCALE,
  children?: Category[],
  productCount?: number,
): Category {
  let localizedNameDraft: Record<string, string> = {};
  let localizedDescriptionDraft: Record<string, string> = {};

  // Parse JSON if it's a string (database quirk)
  try {
    if (typeof dbCategory.localizedName === 'string') {
      localizedNameDraft = JSON.parse(dbCategory.localizedName);
    } else if (dbCategory.localizedName && typeof dbCategory.localizedName === 'object') {
      localizedNameDraft = dbCategory.localizedName as Record<string, string>;
    }
  } catch {
    // Silent fallback
  }

  // Locale-specific selection logic
  const localizedContent = {
    name: asTranslationMap(localizedNameDraft, ''),
    slug: dbCategory.slug as Slug,
    description:
      localizedDescriptionDraft && Object.keys(localizedDescriptionDraft).length > 0
        ? asTranslationMap(localizedDescriptionDraft, '')
        : undefined,
  };

  return {
    id: dbCategory.id,
    slug: dbCategory.slug,
    name: localizedContent.name[language] || localizedContent.name.en || dbCategory.slug,
    description: localizedContent.description?.[language] || localizedContent.description?.en || undefined,
    // ... 10+ more fields
  };
}
```

**Issues**:
- ❌ Repository contains JSON parsing error handling
- ❌ Repository implements locale fallback strategy
- ❌ Repository has knowledge of translation maps
- ❌ `mapToDomain()` is 50+ lines and not easily testable without database

**Where It Should Be**:

```typescript
// ✅ In domain/value-objects or application/mappers
class LocalizationService {
  parseTranslations(raw: string | object): TranslationMap {
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return { en: '' };  // Safe default
      }
    }
    return raw || { en: '' };
  }

  selectByLocale(translations: TranslationMap, locale: Locale): string {
    return translations[locale] || translations.en || '';
  }
}

// Repository just returns raw DB row
class CategoryRepository {
  async getById(id: ID) {
    return await db.query.categories.findOne({ where: { id } });
  }
}

// Service/mapper transforms to domain
class CategoryMapper {
  constructor(private localization: LocalizationService) {}

  toDomain(dbRow: DbCategory, locale: Locale): Category {
    return {
      id: dbRow.id,
      name: this.localization.selectByLocale(
        this.localization.parseTranslations(dbRow.localizedName),
        locale
      ),
      // ...
    };
  }
}
```

---

## PATTERN 5: Repositories Handling Administrative Mutations 🔴

### Issue: Create/Update logic embedded in repository instead of service

**File**: [backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts#L345)

```typescript
// ❌ BAD: Create method has transformation logic in repository
async create(input: ProductInput): Promise<Product> {
  // Transform input to DB format (repository's job? service's job?)
  const localizedName = Object.fromEntries(
    input.translations.map((t) => [t.language, t.name])
  );
  const localizedDescription = Object.fromEntries(
    input.translations.map((t) => [t.language, t.description])
  );
  const localizedLongDescription = Object.fromEntries(
    input.translations.map((t) => [t.language, t.longDescription])
  );

  // Insert
  const [newProduct] = await this.db
    .insert(products)
    .values({
      isActive: input.isActive ?? true,
      categoryId: input.categoryId,
      brandId: input.brandId,
      localizedName: asTranslationMap(localizedName),
      localizedDescription: asTranslationMap(localizedDescription),
      localizedLongDescription: asTranslationMap(localizedLongDescription),
    })
    .returning({ id: products.id });

  // Then calls getById() to re-fetch and hydrate (inefficient!)
  return this.getById(newProduct.id) as Promise<Product>;
}

// BUT: Administrative service ALSO does transformation
class AdminProductMutationService {
  async createProduct(input: CreateProductWithVariantsInput): Promise<{ productId: number }> {
    // Calls db/queries directly (bypassing repository!)
    const productId = await createProductWithVariantsInDb(input);
    
    await this.auditLogService?.logAction({
      entityType: 'product',
      action: 'create',
      newValues: { ...input },
    });

    return { productId };
  }
}
```

**Issues**:
- ❌ Repository's `create()` re-fetches the entire product after insert (inefficient)
- ❌ AdminProductMutationService bypasses repository entirely, calls `@findeg/db/queries` directly
- ❌ Transformation logic (`localizedName = Object.fromEntries(...)`) duplicated
- ❌ No validation in repository (but admin service might validate elsewhere)

**Current Architecture**:
```
Frontend → Dashboard → AdminProductMutationService → db/queries
                                               ↑
                                    Bypasses repositories!
                                    
ProductService → DrizzleProductRepository → db
                ↓
             create() & getById()
```

**Why It's Wrong**:
- Repository and direct query functions maintain separate state
- No single path for audit logging
- Hard to ensure transactionality

---

## PATTERN 6: Private Helper Methods in Repository (Leaking Details) 🔴

### Example: getHydratedVariants(), getProductTags(), getProductAttributes()

**File**: [backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts](backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts#L380)

```typescript
// ❌ BAD: Repository has private methods that do sub-queries
private async getHydratedVariants(
  productIds: number[],
  _language: Locale,
): Promise<Record<number, Variant[]>> {
  if (productIds.length === 0) return {};
  
  const rows = await this.db
    .select({ variant: productVariants })
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds));

  const map: Record<number, Variant[]> = {};
  for (const row of rows) {
    const pid = row.variant.productId;
    if (!map[pid]) map[pid] = [];
    
    // More transformation
    const labelMap = (row.variant.localizedLabel as TranslationMap) || { en: '', ar: '' };
    map[pid].push({
      id: row.variant.id,
      productId: pid,
      sku: row.variant.sku,
      // ... 10+ more fields
    });
  }
  return map;
}

private async getProductTags(productId: number, _language: Locale): Promise<Tag[]> {
  const results = await this.db
    .select({ tag: tags })
    .from(productTags)
    .innerJoin(tags, eq(tags.id, productTags.tagId))
    .where(eq(productTags.productId, productId));
  return results.map((r) => r.tag as Tag);
}

private async getProductAttributes(
  productId: number,
  _language: Locale,
): Promise<ProductAttributeValue[]> {
  const results = await this.db.select({...}).from(variantAttributes)...;
  return results.map((r) => ({...})) as ProductAttributeValue[];
}
```

**Why It's Wrong**:
- ❌ Each method calls the database independently (bad for performance)
- ❌ Private methods hide internal query patterns from testing
- ❌ Other services/repositories can't reuse these queries
- ❌ No lazy-loading capability for consumers who don't need all fields

**Better Approach**:

```typescript
// ✅ Expose as public methods (or in separate query repository)
class ProductQueryRepository {
  async getVariantsByProductIds(ids: number[]): Promise<Record<number, Variant[]>> {
    // Batch query, return map
  }

  async getTagsByProductId(id: number): Promise<Tag[]> {
    // Just fetch tags
  }

  async getAttributesByProductId(id: number): Promise<ProductAttributeValue[]> {
    // Just fetch attributes
  }
}

// Service coordinates
class ProductService {
  async getFullProduct(id: number): Promise<Product> {
    const product = await this.productRepo.getById(id);
    const [variants, tags, attrs] = await Promise.all([
      this.queryRepo.getVariantsByProductIds([id]),
      this.queryRepo.getTagsByProductId(id),
      this.queryRepo.getAttributesByProductId(id),
    ]);

    return this.assembler.assemble(product, variants[id], tags, attrs);
  }
}
```

---

## PATTERN 7: Query Layer Split Inconsistency 🟡

### Issue: Some queries in repositories, some in db/src/queries/

**Current State**:

```
db/src/queries/
├── catalog/
│   ├── search.ts          (executeCatalogScoredSearchRaw, logCatalogSearchRaw)
│   ├── top-products.ts    (getTopProductsRaw)
│   └── ...
└── ...

backend/src/features/catalog/
├── application/
│   └── services/
│       ├── SearchService.ts     (calls db/queries/search.ts)
│       └── ProductService.ts    (calls repository, NOT db/queries)
└── infrastructure/persistence/
    ├── DrizzleProductRepository.ts  (contains all product queries)
    ├── DrizzleVariantRepository.ts  (contains variant queries)
    └── ...
```

**The Problem**:

1. **SearchService** (application) → calls `db/queries` directly (bypassing repository)
2. **ProductService** (application) → calls repository (which contains all queries)
3. **AdminProductMutationService** (admin application) → calls `db/queries` directly (again!)

**Inconsistency**:
- No single source of truth for queries
- Hard to refactor query patterns (where do you change it?)
- Some services know about db/queries, others don't
- Repositories become "Gods" with too many responsibilities

---

## Summary Table: Business Logic Leakage by Severity

| Pattern | Severity | Location | Issue | Impact |
|---------|----------|----------|-------|--------|
| **N+1 Queries** | 🔴 CRITICAL | Product, Order repos | Multiple internal queries per method | Performance at scale, untestable |
| **Complex Matching Logic** | 🔴 CRITICAL | SchoolListRepository.matchVariants() | Business rules in persistence | Can't test without DB, hard to reuse |
| **Repo-to-Repo Coupling** | 🔴 CRITICAL | SchoolList, Inventory repos | Direct instantiation (no DI) | Can't mock, unmaintainable |
| **Data Transformation** | 🟠 HIGH | All repositories | JSON parsing, locale logic in mapToDomain | Testability, maintainability |
| **Private Helpers** | 🟠 HIGH | Product repo | Hidden sub-queries | Performance, testability |
| **Query Layer Inconsistency** | 🟠 HIGH | Across all features | Some use repo, some use db/queries | Confusion, maintenance overhead |
| **Mutation Logic Bypass** | 🟡 MEDIUM | AdminProductMutation | Calls db/queries, bypasses repo | Inconsistent patterns |

---

## Refactoring Recommendations

### Priority 1: Fix Repository-to-Repository Coupling (Highest Impact, Medium Effort)

**Time**: 2-3 hours  
**Risk**: Low (isolated to 2 files)

```typescript
// Step 1: Update DrizzleSchoolListRepository
export class DrizzleSchoolListRepository implements ISchoolListRepository {
  constructor(
    private variantRepo: IVariantRepository,  // ← Inject
  ) {}

  async getItemsWithAlternatives(listId: ID): Promise<SchoolListItemResult[]> {
    // ... same code, but variantRepo is injected ...
  }
}

// Step 2: Update ServiceContainer
get schoolListRepository(): ISchoolListRepository {
  return new DrizzleSchoolListRepository(this.variantRepository);
}

// Step 3: Do the same for DrizzleInventoryRepository
```

### Priority 2: Extract Persistence Primitives from Repositories (Highest Impact, High Effort)

**Time**: 1-2 days  
**Risk**: Medium (affects all services)

Create a new pattern:

```typescript
// ✅ NEW: Persistence primitives (simple, testable)
class ProductQueryRepository {
  async getById(id: number): Promise<DbProduct | null> {
    // Just fetch, no hydration
    return await db.query.products.findOne({ where: { id } });
  }

  async getByIds(ids: number[]): Promise<DbProduct[]> {
    // Batch fetch
  }

  async getVariantsByProductIds(ids: number[]): Promise<Record<number, DbVariant[]>> {
    // Batch fetch variants for multiple products
  }

  async getTagsByProductIds(ids: number[]): Promise<Record<number, Tag[]>> {
    // Batch fetch tags
  }
}

// ✅ NEW: Domain assembler (pure business logic)
class ProductAssembler {
  assemble(dbProduct: DbProduct, variants: DbVariant[], tags: Tag[]): Product {
    // Transform to domain entity
    return {
      id: dbProduct.id,
      name: this.localization.selectByLocale(dbProduct.localizedName, 'en'),
      variants: variants.map(v => this.assembleVariant(v)),
      // ...
    };
  }
}

// ✅ SERVICE: Orchestrate
class ProductService {
  constructor(
    private queries: ProductQueryRepository,
    private assembler: ProductAssembler,
  ) {}

  async getById(id: number): Promise<Product | null> {
    const product = await this.queries.getById(id);
    if (!product) return null;

    const [variants, tags] = await Promise.all([
      this.queries.getVariantsByProductIds([id]),
      this.queries.getTagsByProductIds([id]),
    ]);

    return this.assembler.assemble(product, variants[id], tags);
  }

  async getAll(): Promise<Product[]> {
    const products = await this.queries.getAll();
    
    const [variantsMap, tagsMap] = await Promise.all([
      this.queries.getVariantsByProductIds(products.map(p => p.id)),
      this.queries.getTagsByProductIds(products.map(p => p.id)),
    ]);

    return products.map(p => 
      this.assembler.assemble(p, variantsMap[p.id], tagsMap[p.id])
    );
  }
}
```

### Priority 3: Standardize Query Layer (Medium Impact, Medium Effort)

**Time**: 1 day  
**Risk**: Low (refactoring)

Create a consistent pattern for ALL queries:

```
backend/src/features/{feature}/
├── application/
│   └── services/       (orchestration, business logic)
└── infrastructure/
    └── persistence/
        ├── {Feature}QueryRepository.ts       (primitives: getById, getByIds, etc.)
        └── {Feature}CommandRepository.ts     (mutations: create, update, delete, etc.)

db/src/queries/
├── REMOVE: Raw queries (move to repositories)
└── Keep only: Complex analytical queries that don't fit standard CRUD
```

---

## Clean Architecture After Refactoring

```
┌─────────────────────────────────────────────────────────────┐
│ DOMAIN LAYER (Pure Business Logic, No Framework)           │
├─────────────────────────────────────────────────────────────┤
│ • Product entity with methods                               │
│ • VariantMatcher (match rules)                              │
│ • InventoryReservationPolicy (stock logic)                  │
│ • SchoolListMatchingRules (attribute matching)              │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (Use Cases, Orchestration)               │
├─────────────────────────────────────────────────────────────┤
│ • ProductService.getById() → orchestrate queries            │
│ • ProductService.searchByAttributes() → use VariantMatcher │
│ • InventoryService.reserveStock() → use ReservationPolicy │
│ • ProductAssembler (transforms DB → Domain)                │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER (Persistence Primitives ONLY)         │
├─────────────────────────────────────────────────────────────┤
│ • ProductQueryRepository.getById(id)                        │
│ • ProductQueryRepository.getByIds(ids)                      │
│ • ProductQueryRepository.getVariantsByProductIds(ids)       │
│ • ProductCommandRepository.create(data)                     │
│ • ProductCommandRepository.update(id, data)                 │
│ • NO mapToDomain(), NO N+1 queries, NO business logic      │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Checklist

After refactoring, verify:

- [ ] No private async methods in repositories (all helpers are public)
- [ ] Repository methods return raw DB data or minimal DTOs
- [ ] All orchestration happens in services/assemblers
- [ ] No `new Drizzle*Repository()` in repositories (only DI)
- [ ] No JSON parsing in repositories (move to assemblers)
- [ ] No business rules in repositories (move to domain)
- [ ] No locale selection logic in repositories (move to localization service)
- [ ] No N+1 queries (batch load in service)
- [ ] Run `pnpm --filter @findeg/backend type-check` (0 errors)
- [ ] Run `pnpm --filter @findeg/backend lint` (0 errors)
- [ ] Smoke test: Product list, detail, search, admin create/edit

---

## Related Documentation

- [Clean Architecture](../docs/architecture/clean-architecture.md)
- [Backend Migration Patterns](../docs/architecture/BACKEND_MIGRATION_PATTERNS.md)
- [Architecture Playbook](../docs/architecture/ARCHITECTURE_PLAYBOOK.md)

---

**Status**: Ready for refactoring  
**Priority**: HIGH — Blocks performance optimization and testing improvements  
**Owner**: Backend team  
**Review By**: Architecture review before implementation
