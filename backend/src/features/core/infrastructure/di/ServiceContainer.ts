import {
  IAdminBrandService,
  IAdminCategoryService,
  IAdminCollectionService,
  IAdminDashboardService,
  IAdminInventoryService,
  IAdminOrderService,
  IAdminProductService,
  IAdminTagService,
  IAuditLogRepository,
  IAuditLogService,
  IProductImportService,
} from '@findeg/backend/features/administration/application/interfaces';
import {
  CategoryService,
  CollectionService,
  IAdminSearchAnalyticsRepository,
  IAdminSearchAnalyticsService,
  IBrandRepository,
  ICategoryRepository,
  ICategoryService,
  ICollectionRepository,
  ICollectionService,
  IInventoryRepository,
  IProductRepository,
  IProductService,
  ISchoolListRepository,
  ISchoolListService,
  ISearchService,
  ITagRepository,
  IVariantRepository,
  ProductService,
  SchoolListService,
} from '@findeg/backend/features/catalog';
import {
  IAdminRoleService,
  IAdminUserService,
  IAuthService,
  IUserRepository,
} from '@findeg/backend/features/identity';
import {
  IEmailService,
  INotificationRepository,
  INotificationService,
  NotificationEventService,
  NotificationService,
} from '@findeg/backend/features/notifications';
import { IOrderRepository } from '@findeg/backend/features/order';
import { IReviewRepository, IReviewService, ReviewService } from '@findeg/backend/features/review';
import { IParentSessionRepository } from '@findeg/backend/features/school/application/interfaces/IParentSessionRepository';
import { ISchoolAccessRepository } from '@findeg/backend/features/school/application/interfaces/ISchoolAccessRepository';
import { ILoggerService, IStorageProvider } from '../../application/interfaces';
import { CartService, ICartService } from '@findeg/backend/features/cart';
import { MediaService } from '@findeg/backend/features/media';
import {
  IParentListService,
  ISchoolAccessService,
  ISchoolDirectoryService,
  ParentListService,
  SchoolAccessService,
  SchoolDirectoryService,
} from '@findeg/backend/features/school';
import { DrizzleProductRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleProductRepository';
import { DrizzleCategoryRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleCategoryRepository';
import { DrizzleUserRepository } from '@findeg/backend/features/identity/infrastructure/persistence/DrizzleUserRepository';
import { DrizzleOrderRepository } from '@findeg/backend/features/order/infrastructure/persistence/DrizzleOrderRepository';
import { DrizzleReviewRepository } from '@findeg/backend/features/review/infrastructure/persistence/DrizzleReviewRepository';
import { DrizzleBrandRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleBrandRepository';
import { DrizzleCollectionRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleCollectionRepository';
import { DrizzleTagRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleTagRepository';
import { DrizzleAuditLogRepository } from '@findeg/backend/features/administration/infrastructure';
import { DrizzleSchoolListRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleSchoolListRepository';
import { DrizzleInventoryRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleInventoryRepository';
import { DrizzleVariantRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleVariantRepository';
import { DrizzleSchoolAccessRepository } from '@findeg/backend/features/school/infrastructure/DrizzleSchoolAccessRepository';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';
import { ResendEmailService } from '@findeg/backend/features/notifications/infrastructure/ResendEmailService';
import {
  AdminRoleService,
  AdminUserService,
  AuthService,
} from '@findeg/backend/features/identity/application/services';
import { SearchService } from '@findeg/backend/features/catalog/application/services/SearchService';
import {
  AdminBrandService,
  AdminCategoryService,
  AdminCollectionService,
  AdminDashboardService,
  AdminInventoryService,
  AdminOrderService,
  AdminProductService,
  AdminTagService,
  AuditLogService,
  ProductImportService,
} from '@findeg/backend/features/administration/application/services';
import { LoggerService } from '../../application/services/LoggerService';
import { DrizzleParentSessionRepository } from '@findeg/backend/features/school/infrastructure/DrizzleParentSessionRepository';
import { DrizzleNotificationRepository } from '@findeg/backend/features/notifications/infrastructure/DrizzleNotificationRepository';
import { DrizzleAdminSearchAnalyticsRepository } from '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleAdminSearchAnalyticsRepository';
import { AdminSearchAnalyticsService } from '@findeg/backend/features/catalog/application/services/AdminSearchAnalyticsService';

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
  private constructor() {}

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
      //  this.mediaService,
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
        this.orderRepository,
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
        this.schoolAccessService,
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
