/**
 * Service Container

 *
 * Simple Dependency Injection container to manage singleton instances
 * of repositories and services.
 *
 * All getters return interface types (not concrete classes)
 * to enforce proper abstraction boundaries.
 *
 * Note: This container is intended for server-side use only (Server Actions, API routes).
 * The framework layer (dashboard/storefront apps) is responsible for ensuring server-only execution.
 */

import { DrizzleProductRepository } from "@features/catalog/infrastructure/persistence/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "@features/catalog/infrastructure/persistence/DrizzleCategoryRepository";
import { DrizzleUserRepository } from "@features/identity/infrastructure/persistence/DrizzleUserRepository";
import { DrizzleOrderRepository } from "@features/order/infrastructure/persistence/DrizzleOrderRepository";
import { DrizzleReviewRepository } from "@features/review/infrastructure/persistence/DrizzleReviewRepository";
import { DrizzleBrandRepository } from "@features/catalog/infrastructure/persistence/DrizzleBrandRepository";
import { DrizzleCollectionRepository } from "@features/catalog/infrastructure/persistence/DrizzleCollectionRepository";
import { DrizzleAuditLogRepository } from "@features/administration/infrastructure/DrizzleAuditLogRepository";
import { DrizzleTagRepository } from "@features/catalog/infrastructure/persistence/DrizzleTagRepository";
import { DrizzleInventoryRepository } from "@features/catalog/infrastructure/persistence/DrizzleInventoryRepository";
import { DrizzleVariantRepository } from "@features/catalog/infrastructure/persistence/DrizzleVariantRepository";
import { DrizzleSchoolListRepository } from "@features/catalog/infrastructure/persistence/DrizzleSchoolListRepository";

import { LocalStorageProvider } from "../storage/LocalStorageProvider";

import { AuthService } from "@features/identity/application/services/AuthService";
import { ProductService } from "@features/catalog/application/services/ProductService";
import { CategoryService } from "@features/catalog/application/services/CategoryService";
import { CollectionService } from "@features/catalog/application/services/CollectionService";
import { CartService } from "@features/cart/application/services/CartService";
import { MediaService } from "@features/media/application/services/MediaService";
import {
  SchoolListService,
  type ISchoolListService,
} from "@features/catalog/application/services/SchoolListService";
import { SearchService } from "@features/catalog/application/services/SearchService";
import { type ISearchService } from "@features/catalog/application/interfaces/ISearchService";
import { ReviewService } from "@features/review/application/services/ReviewService";
import { type IReviewService } from "@features/review/application/interfaces/IReviewService";

import { AdminUserService } from "@features/identity/application/services/AdminUserService";
import { AdminRoleService } from "@features/identity/application/services/AdminRoleService";
import {
  AdminProductService,
  AdminCategoryService,
  AdminDashboardService,
  AdminBrandService,
  AdminOrderService,
  AdminInventoryService,
  AdminTagService,
  AdminCollectionService,
  AuditLogService,
  ProductImportService,
} from "@features/administration/application/services";
import { LoggerService } from "@features/core/application/services/LoggerService";
import { ResendEmailService } from "@features/notifications/infrastructure/ResendEmailService";
import { IEmailService } from "@features/notifications/application/services/IEmailService";

import { IAdminUserService } from "@features/identity/application/interfaces/IAdminUserService";
import { IAdminRoleService } from "@features/identity/application/interfaces/IAdminRoleService";
import { IProductRepository } from "@features/catalog/application/interfaces/IProductRepository";
import { ICategoryRepository } from "@features/catalog/application/interfaces/ICategoryRepository";
import { IUserRepository } from "@features/identity/application/interfaces/IUserRepository";
import { IOrderRepository } from "@features/order/application/interfaces/IOrderRepository";
import { IReviewRepository } from "@features/review/application/interfaces/IReviewRepository";
import { IBrandRepository } from "@features/catalog/application/interfaces/IBrandRepository";
import { ICollectionRepository } from "@features/catalog/application/interfaces/ICollectionRepository";
import { IAuditLogRepository } from "@features/administration/application/interfaces/IAuditLogRepository";
import { ISchoolListRepository } from "@features/catalog/application/interfaces/ISchoolListRepository";
import { IInventoryRepository } from "@features/catalog/application/interfaces/IInventoryRepository";
import { ITagRepository } from "@features/catalog/application/interfaces/ITagRepository";
import type { IVariantRepository } from "@features/catalog/application/interfaces/IVariantRepository";
import type { ISchoolAccessRepository } from "@features/school/application/interfaces/ISchoolAccessRepository";
import { DrizzleSchoolAccessRepository } from "@features/school/infrastructure/DrizzleSchoolAccessRepository";
import { DrizzleParentSessionRepository } from "@features/school/infrastructure/DrizzleParentSessionRepository";
import { ParentListService } from "@features/school/application/services/ParentListService";
import { ISchoolAccessService } from "@features/school/application/interfaces/ISchoolAccessService";
import { SchoolAccessService } from "@features/school/application/services/SchoolAccessService";
import { ISchoolDirectoryService } from "@features/school/application/interfaces/ISchoolDirectoryService";
import { SchoolDirectoryService } from "@features/school/application/services/SchoolDirectoryService";

import { IAuthService } from "@features/identity/application/interfaces/IAuthService";
import { IProductService } from "@features/catalog/application/interfaces/IProductService";
import { ICategoryService } from "@features/catalog/application/interfaces/ICategoryService";
import { ICollectionService } from "@features/catalog/application/interfaces/ICollectionService";
import { ICartService } from "@features/cart/application/interfaces/ICartService";
import {
  IAdminProductService,
  IAdminCategoryService,
  IAdminDashboardService,
  IAdminBrandService,
  IAdminOrderService,
  IAdminInventoryService,
  IAdminTagService,
  IAdminCollectionService,
  IAuditLogService,
  IProductImportService,
} from "@features/administration/application/interfaces";
import { IStorageProvider } from "@features/core/application/interfaces/IStorageProvider";
import { ILoggerService } from "@features/core/application/interfaces/ILoggerService";
import { IParentListService } from "@features/school/application/interfaces/IParentListService";
import { IParentSessionRepository } from "@features/school/application/interfaces/IParentSessionRepository";
import { INotificationRepository } from "@features/notifications/application/interfaces/INotificationRepository";
import { INotificationService } from "@features/notifications/application/interfaces/INotificationService";
import { DrizzleNotificationRepository } from "@features/notifications/infrastructure/DrizzleNotificationRepository";
import { NotificationService } from "@features/notifications/application/services/NotificationService";
import { NotificationEventService } from "@features/notifications/application/services/NotificationEventService";

import { IAdminSearchAnalyticsRepository } from "@features/catalog/application/interfaces/IAdminSearchAnalyticsRepository";
import { DrizzleAdminSearchAnalyticsRepository } from "@features/catalog/infrastructure/persistence/DrizzleAdminSearchAnalyticsRepository";
import { IAdminSearchAnalyticsService } from "@features/catalog/application/interfaces/IAdminSearchAnalyticsService";
import { AdminSearchAnalyticsService } from "@features/catalog/application/services/AdminSearchAnalyticsService";

/**
 * Validates dependency injection wiring
 */
export class ServiceContainer {
  private static instance: ServiceContainer;

  // ─── 1. Repositories (Data Access) ────────────────────────────────────
  private _productRepository?: IProductRepository;
  private _categoryRepository?: ICategoryRepository;
  private _userRepository?: IUserRepository;
  private _orderRepository?: IOrderRepository;
  private _reviewRepository?: IReviewRepository;
  private _brandRepository?: IBrandRepository;
  private _collectionRepository?: ICollectionRepository;
  private _auditLogRepository?: IAuditLogRepository;
  private _schoolListRepository?: ISchoolListRepository;
  private _inventoryRepository?: IInventoryRepository;
  private _tagRepository?: ITagRepository;
  private _variantRepository?: IVariantRepository;
  private _schoolAccessRepository?: ISchoolAccessRepository;
  private _parentSessionRepository?: IParentSessionRepository;
  private _notificationRepository?: INotificationRepository;

  // ─── 2. Infrastructure Services ───────────────────────────────────────
  private _storageProvider?: IStorageProvider;
  private _emailService?: IEmailService;

  // ─── 3. Application Services (Shop / Customer) ────────────────────────
  private _authService?: IAuthService;
  private _productService?: IProductService;
  private _categoryService?: ICategoryService;
  private _collectionService?: ICollectionService;
  private _cartService?: ICartService;
  private _mediaService?: MediaService;
  private _schoolListService?: ISchoolListService; // Catalog bounded context school list service
  private _searchService?: ISearchService;
  private _reviewService?: IReviewService;

  // School Features
  private _schoolDirectoryService?: ISchoolDirectoryService;
  private _schoolAccessService?: ISchoolAccessService;
  private _parentListService?: IParentListService;
  private _notificationService?: INotificationService;
  private _notificationEventService?: NotificationEventService;
  private _adminSearchAnalyticsRepository?: IAdminSearchAnalyticsRepository;
  private _adminSearchAnalyticsService?: IAdminSearchAnalyticsService;
  // MediaService is a concrete class but could implement an interface.
  // Using concrete type here as it's not in interfaces barrel yet as interface, but we use it as type in constructor params.

  // ─── 4. Admin Services (Back-office) ──────────────────────────────────
  private _adminProductService?: IAdminProductService;
  private _adminCategoryService?: IAdminCategoryService;
  private _adminDashboardService?: IAdminDashboardService;
  private _adminBrandService?: IAdminBrandService;
  private _adminOrderService?: IAdminOrderService;
  private _adminInventoryService?: IAdminInventoryService;
  private _adminTagService?: IAdminTagService;
  private _adminCollectionService?: IAdminCollectionService;
  private _auditLogService?: IAuditLogService;
  private _productImportService?: IProductImportService;
  private _loggerService?: ILoggerService;
  private _adminUserService?: IAdminUserService;
  private _adminRoleService?: IAdminRoleService;

  /**
   *
   */
  private constructor() { }

  /**
   *
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // ============================================================================
  //  1. REPOSITORIES - Concrete Implementations
  // ============================================================================

  /**
   * Data access for products.
   * Handles multi-language retrieval and search.
   */
  get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new DrizzleProductRepository();
    }
    return this._productRepository;
  }

  /**
   * Data access for categories.
   * Supports hierarchical category structures.
   */
  get categoryRepository(): ICategoryRepository {
    if (!this._categoryRepository) {
      this._categoryRepository = new DrizzleCategoryRepository();
    }
    return this._categoryRepository;
  }

  /**
   * Data access for system users and administrative accounts.
   */
  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new DrizzleUserRepository();
    }
    return this._userRepository;
  }

  /**
   * Data access for customer orders and transaction history.
   */
  get orderRepository(): IOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new DrizzleOrderRepository();
    }
    return this._orderRepository;
  }

  /**
   * Data access for product reviews and ratings.
   */
  get reviewRepository(): IReviewRepository {
    if (!this._reviewRepository) {
      this._reviewRepository = new DrizzleReviewRepository();
    }
    return this._reviewRepository;
  }

  /**
   * Data access for product brands/manufacturers.
   */
  get brandRepository(): IBrandRepository {
    if (!this._brandRepository) {
      this._brandRepository = new DrizzleBrandRepository();
    }
    return this._brandRepository;
  }

  /**
   * Data access for product collections.
   */
  get collectionRepository(): ICollectionRepository {
    if (!this._collectionRepository) {
      this._collectionRepository = new DrizzleCollectionRepository();
    }
    return this._collectionRepository;
  }

  /**
   * Data access for taxonomy tags.
   */
  get tagRepository(): ITagRepository {
    if (!this._tagRepository) {
      this._tagRepository = new DrizzleTagRepository();
    }
    return this._tagRepository!;
  }

  /**
   * Data access for administrative audit logs.
   * Tracks all sensitive actions performed in the admin dashboard.
   */
  get auditLogRepository(): IAuditLogRepository {
    if (!this._auditLogRepository) {
      this._auditLogRepository = new DrizzleAuditLogRepository();
    }
    return this._auditLogRepository;
  }

  /**
   * Data access for school supply lists.
   */
  get schoolListRepository(): ISchoolListRepository {
    if (!this._schoolListRepository) {
      this._schoolListRepository = new DrizzleSchoolListRepository();
    }
    return this._schoolListRepository;
  }

  /**
   * Data access for inventory balances and movements.
   */
  get inventoryRepository(): IInventoryRepository {
    if (!this._inventoryRepository) {
      this._inventoryRepository = new DrizzleInventoryRepository();
    }
    return this._inventoryRepository;
  }

  /**
   * Data access for product variants (SKUs).
   */
  get variantRepository(): IVariantRepository {
    if (!this._variantRepository) {
      this._variantRepository = new DrizzleVariantRepository();
    }
    return this._variantRepository;
  }

  /**
   * Data access for school access management.
   */
  get schoolAccessRepository(): ISchoolAccessRepository {
    if (!this._schoolAccessRepository) {
      this._schoolAccessRepository = new DrizzleSchoolAccessRepository();
    }
    return this._schoolAccessRepository;
  }

  // ============================================================================
  //  2. INFRASTRUCTURE SERVICES
  // ============================================================================

  /**
   * Provider for file storage (e.g., Local filesystem, S3).
   */
  get storageProvider(): IStorageProvider {
    if (!this._storageProvider) {
      // Could switch on env vars like STORAGE_PROVIDER=S3
      this._storageProvider = new LocalStorageProvider();
    }
    return this._storageProvider;
  }

  /**
   * Service for sending transactional emails.
   */
  get emailService(): IEmailService {
    if (!this._emailService) {
      this._emailService = new ResendEmailService();
    }
    return this._emailService;
  }

  /**
   * Service for managing media assets and uploads.
   */
  get mediaService(): MediaService {
    if (!this._mediaService) {
      this._mediaService = new MediaService(this.storageProvider);
    }
    return this._mediaService;
  }

  // ============================================================================
  //  3. APPLICATION SERVICES (Shop Facing)
  // ============================================================================

  /**
   * Application service for customer authentication and authorization.
   */
  get authService(): IAuthService {
    if (!this._authService) {
      this._authService = new AuthService(this.userRepository);
    }
    return this._authService;
  }

  /**
   * Application service for public catalog browsing.
   */
  get productService(): IProductService {
    if (!this._productService) {
      this._productService = new ProductService(this.productRepository);
    }
    return this._productService;
  }

  /**
   * Application service for public category exploration.
   */
  get categoryService(): ICategoryService {
    if (!this._categoryService) {
      this._categoryService = new CategoryService(this.categoryRepository);
    }
    return this._categoryService;
  }

  /**
   * Application service for public collections exploration.
   */
  get collectionService(): ICollectionService {
    if (!this._collectionService) {
      this._collectionService = new CollectionService(this.collectionRepository);
    }
    return this._collectionService;
  }

  /**
   * Application service for managing shopping cart state.
   */
  get cartService(): ICartService {
    if (!this._cartService) {
      this._cartService = new CartService();
    }
    return this._cartService;
  }

  /**
   * School list management service.
   */
  get schoolListService(): ISchoolListService {
    if (!this._schoolListService) {
      this._schoolListService = new SchoolListService(this.schoolListRepository);
    }
    return this._schoolListService;
  }

  /**
   * Access management for school lists.
   */
  get schoolAccessService(): ISchoolAccessService {
    if (!this._schoolAccessService) {
      this._schoolAccessService = new SchoolAccessService(
        this.schoolAccessRepository,
        this.schoolListRepository,
        this.userRepository,
      );
    }
    return this._schoolAccessService;
  }

  /**
   * Public school browsing and suggestions.
   */
  get schoolDirectoryService(): ISchoolDirectoryService {
    if (!this._schoolDirectoryService) {
      this._schoolDirectoryService = new SchoolDirectoryService();
    }
    return this._schoolDirectoryService;
  }

  /**
   * Application service for full-text search and suggestions.
   */
  get searchService(): ISearchService {
    if (!this._searchService) {
      this._searchService = new SearchService(this.productRepository);
    }
    return this._searchService;
  }

  /**
   * Application service for product reviews.
   */
  get reviewService(): IReviewService {
    if (!this._reviewService) {
      this._reviewService = new ReviewService(this.reviewRepository, this.orderRepository);
    }
    return this._reviewService;
  }

  // ============================================================================
  //  4. ADMIN SERVICES (Back-office)
  // ============================================================================

  /**
   * Backend service for managing administrative audit trails.
   */
  get auditLogService(): IAuditLogService {
    if (!this._auditLogService) {
      this._auditLogService = new AuditLogService(this.auditLogRepository);
    }
    return this._auditLogService;
  }

  /**
   * Backend service for administrative product management.
   */
  get adminProductService(): IAdminProductService {
    if (!this._adminProductService) {
      this._adminProductService = new AdminProductService(
        this.productRepository,
        this.categoryRepository,
        this.brandRepository,
        this.auditLogService,
        this.mediaService,
      );
    }
    return this._adminProductService;
  }

  /**
   * Backend service for bulk importing products from CSV.
   */
  get productImportService(): IProductImportService {
    if (!this._productImportService) {
      this._productImportService = new ProductImportService(
        this.adminProductService,
        this.productRepository,
      );
    }
    return this._productImportService;
  }

  /**
   * Backend service for administrative category management.
   */
  get adminCategoryService(): IAdminCategoryService {
    if (!this._adminCategoryService) {
      this._adminCategoryService = new AdminCategoryService(
        this.categoryRepository,
        this.auditLogService,
      );
    }
    return this._adminCategoryService;
  }

  /**
   * Backend service for administrative dashboard analytics and summaries.
   */
  get adminDashboardService(): IAdminDashboardService {
    if (!this._adminDashboardService) {
      this._adminDashboardService = new AdminDashboardService(
        this.productRepository,
        this.categoryRepository,
        this.orderRepository,
        this.brandRepository,
      );
    }
    return this._adminDashboardService;
  }

  /**
   * Backend service for administrative brand management.
   */
  get adminBrandService(): IAdminBrandService {
    if (!this._adminBrandService) {
      this._adminBrandService = new AdminBrandService(this.brandRepository, this.auditLogService);
    }
    return this._adminBrandService;
  }

  /**
   * Backend service for administrative order management.
   */
  get adminOrderService(): IAdminOrderService {
    if (!this._adminOrderService) {
      this._adminOrderService = new AdminOrderService(
        this.orderRepository,
        this.auditLogService,
        this.emailService,
      );
    }
    return this._adminOrderService;
  }

  /**
   * Backend service for administrative inventory and stock management.
   */
  get adminInventoryService(): IAdminInventoryService {
    if (!this._adminInventoryService) {
      this._adminInventoryService = new AdminInventoryService(
        this.productRepository,
        this.inventoryRepository,
        this.variantRepository,
        this.auditLogService,
      );
    }
    return this._adminInventoryService;
  }

  /**
   * Backend service for administrative tag management.
   */
  get adminTagService(): IAdminTagService {
    if (!this._adminTagService) {
      this._adminTagService = new AdminTagService(this.tagRepository, this.auditLogService);
    }
    return this._adminTagService!;
  }

  /**
   * Backend service for administrative collection management.
   */
  get adminCollectionService(): IAdminCollectionService {
    if (!this._adminCollectionService) {
      this._adminCollectionService = new AdminCollectionService(
        this.collectionRepository,
        this.auditLogService,
      );
    }
    return this._adminCollectionService!;
  }

  /**
   * System-wide logging service for tracking errors and operational events.
   */
  get loggerService(): ILoggerService {
    if (!this._loggerService) {
      this._loggerService = new LoggerService();
    }
    return this._loggerService;
  }

  /**
   * Service for managing admin users, roles, and permission overrides.
   */
  get adminUserService(): IAdminUserService {
    if (!this._adminUserService) {
      this._adminUserService = new AdminUserService();
    }
    return this._adminUserService;
  }

  /**
   * Service for managing admin roles and their permission assignments.
   */
  get adminRoleService(): IAdminRoleService {
    if (!this._adminRoleService) {
      this._adminRoleService = new AdminRoleService();
    }
    return this._adminRoleService;
  }

  /**
   *
   */
  public get parentSessionRepository(): IParentSessionRepository {
    if (!this._parentSessionRepository) {
      this._parentSessionRepository = new DrizzleParentSessionRepository();
    }
    return this._parentSessionRepository;
  }

  /**
   *
   */
  public get parentListService(): IParentListService {
    if (!this._parentListService) {
      this._parentListService = new ParentListService(
        this.parentSessionRepository,
        this.schoolDirectoryService,
      );
    }
    return this._parentListService;
  }

  /**
   *
   */
  public get notificationRepository(): INotificationRepository {
    if (!this._notificationRepository) {
      this._notificationRepository = new DrizzleNotificationRepository();
    }
    return this._notificationRepository;
  }

  /**
   *
   */
  public get notificationService(): INotificationService {
    if (!this._notificationService) {
      this._notificationService = new NotificationService(this.notificationRepository);
    }
    return this._notificationService;
  }

  /**
   *
   */
  public get notificationEventService(): NotificationEventService {
    if (!this._notificationEventService) {
      this._notificationEventService = new NotificationEventService(
        this.notificationService,
        this.emailService,
      );
    }
    return this._notificationEventService;
  }

  /**
   *
   */
  public get adminSearchAnalyticsRepository(): IAdminSearchAnalyticsRepository {
    if (!this._adminSearchAnalyticsRepository) {
      this._adminSearchAnalyticsRepository = new DrizzleAdminSearchAnalyticsRepository();
    }
    return this._adminSearchAnalyticsRepository;
  }

  /**
   *
   */
  public get adminSearchAnalyticsService(): IAdminSearchAnalyticsService {
    if (!this._adminSearchAnalyticsService) {
      this._adminSearchAnalyticsService = new AdminSearchAnalyticsService(
        this.adminSearchAnalyticsRepository,
      );
    }
    return this._adminSearchAnalyticsService;
  }
}

export const container = ServiceContainer.getInstance();
