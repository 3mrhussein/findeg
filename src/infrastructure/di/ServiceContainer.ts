/**
 * Service Container
 *
 * Simple Dependency Injection container to manage singleton instances
 * of repositories and services.
 *
 * All getters return interface types (not concrete classes)
 * to enforce proper abstraction boundaries.
 */

import { DrizzleProductRepository } from "../repositories/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "../repositories/DrizzleCategoryRepository";
import { DrizzleUserRepository } from "../repositories/DrizzleUserRepository";
import { DrizzleOrderRepository } from "../repositories/DrizzleOrderRepository";
import { DrizzleReviewRepository } from "../repositories/DrizzleReviewRepository";
import { DrizzleBrandRepository } from "../repositories/DrizzleBrandRepository";
import { DrizzleAuditLogRepository } from "../repositories/DrizzleAuditLogRepository";

import { CookieSessionProvider } from "../auth/CookieSessionProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";

import { AuthService } from "@/application/services/AuthService";
import { ProductService } from "@/application/services/ProductService";
import { CategoryService } from "@/application/services/CategoryService";
import { CartService } from "@/application/services/CartService";
import { MediaService } from "@/application/services/MediaService";

import { AdminProductService } from "@/application/services/AdminProductService";
import { AdminCategoryService } from "@/application/services/AdminCategoryService";
import { AdminDashboardService } from "@/application/services/AdminDashboardService";
import { AdminBrandService } from "@/application/services/AdminBrandService";
import { AdminOrderService } from "@/application/services/AdminOrderService";
import { AdminInventoryService } from "@/application/services/AdminInventoryService";
import { AuditLogService } from "@/application/services/AuditLogService";
import { LoggerService } from "@/application/services/LoggerService";

import { IProductRepository } from "@/application/repositories/IProductRepository";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { IUserRepository } from "@/application/repositories/IUserRepository";
import { IOrderRepository } from "@/application/repositories/IOrderRepository";
import { IReviewRepository } from "@/application/repositories/IReviewRepository";
import { IBrandRepository } from "@/application/repositories/IBrandRepository";
import { IAuditLogRepository } from "@/application/repositories/IAuditLogRepository";

import {
  IAuthService,
  IProductService,
  ICategoryService,
  ICartService,
  IAdminProductService,
  IAdminCategoryService,
  IAdminDashboardService,
  IAdminBrandService,
  IAdminOrderService,
  IAdminInventoryService,
  IAuditLogService,
  ISessionProvider,
  IStorageProvider,
} from "@/application/services/interfaces";
import { ILoggerService } from "@/application/services/interfaces/ILoggerService";

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
  private _auditLogRepository?: IAuditLogRepository;

  // ─── 2. Infrastructure Services ───────────────────────────────────────
  private _sessionProvider?: ISessionProvider;
  private _storageProvider?: IStorageProvider;

  // ─── 3. Application Services (Shop / Customer) ────────────────────────
  private _authService?: IAuthService;
  private _productService?: IProductService;
  private _categoryService?: ICategoryService;
  private _cartService?: ICartService;
  private _mediaService?: MediaService;
  // MediaService is a concrete class but could implement an interface.
  // Using concrete type here as it's not in interfaces barrel yet as interface, but we use it as type in constructor params.

  // ─── 4. Admin Services (Back-office) ──────────────────────────────────
  private _adminProductService?: IAdminProductService;
  private _adminCategoryService?: IAdminCategoryService;
  private _adminDashboardService?: IAdminDashboardService;
  private _adminBrandService?: IAdminBrandService;
  private _adminOrderService?: IAdminOrderService;
  private _adminInventoryService?: IAdminInventoryService;
  private _auditLogService?: IAuditLogService;
  private _loggerService?: ILoggerService;

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
   *
   */
  get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new DrizzleProductRepository();
    }
    return this._productRepository;
  }

  /**
   *
   */
  get categoryRepository(): ICategoryRepository {
    if (!this._categoryRepository) {
      this._categoryRepository = new DrizzleCategoryRepository();
    }
    return this._categoryRepository;
  }

  /**
   *
   */
  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new DrizzleUserRepository();
    }
    return this._userRepository;
  }

  /**
   *
   */
  get orderRepository(): IOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new DrizzleOrderRepository();
    }
    return this._orderRepository;
  }

  /**
   *
   */
  get reviewRepository(): IReviewRepository {
    if (!this._reviewRepository) {
      this._reviewRepository = new DrizzleReviewRepository();
    }
    return this._reviewRepository;
  }

  /**
   *
   */
  get brandRepository(): IBrandRepository {
    if (!this._brandRepository) {
      this._brandRepository = new DrizzleBrandRepository();
    }
    return this._brandRepository;
  }

  /**
   *
   */
  get auditLogRepository(): IAuditLogRepository {
    if (!this._auditLogRepository) {
      this._auditLogRepository = new DrizzleAuditLogRepository();
    }
    return this._auditLogRepository;
  }

  // ============================================================================
  //  2. INFRASTRUCTURE SERVICES
  // ============================================================================

  /**
   *
   */
  get sessionProvider(): ISessionProvider {
    if (!this._sessionProvider) {
      this._sessionProvider = new CookieSessionProvider();
    }
    return this._sessionProvider;
  }

  /**
   *
   */
  get storageProvider(): IStorageProvider {
    if (!this._storageProvider) {
      // Could switch on env vars like STORAGE_PROVIDER=S3
      this._storageProvider = new LocalStorageProvider();
    }
    return this._storageProvider;
  }

  /**
   *
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
   *
   */
  get authService(): IAuthService {
    if (!this._authService) {
      this._authService = new AuthService(this.userRepository, this.sessionProvider);
    }
    return this._authService;
  }

  /**
   *
   */
  get productService(): IProductService {
    if (!this._productService) {
      this._productService = new ProductService(this.productRepository);
    }
    return this._productService;
  }

  /**
   *
   */
  get categoryService(): ICategoryService {
    if (!this._categoryService) {
      this._categoryService = new CategoryService(this.categoryRepository);
    }
    return this._categoryService;
  }

  /**
   *
   */
  get cartService(): ICartService {
    if (!this._cartService) {
      this._cartService = new CartService();
    }
    return this._cartService;
  }

  // ============================================================================
  //  4. ADMIN SERVICES (Back-office)
  // ============================================================================

  /**
   *
   */
  get auditLogService(): IAuditLogService {
    if (!this._auditLogService) {
      this._auditLogService = new AuditLogService(this.auditLogRepository);
    }
    return this._auditLogService;
  }

  /**
   *
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
   *
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
   *
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
   *
   */
  get adminBrandService(): IAdminBrandService {
    if (!this._adminBrandService) {
      this._adminBrandService = new AdminBrandService(this.brandRepository, this.auditLogService);
    }
    return this._adminBrandService;
  }

  /**
   *
   */
  get adminOrderService(): IAdminOrderService {
    if (!this._adminOrderService) {
      this._adminOrderService = new AdminOrderService(this.orderRepository, this.auditLogService);
    }
    return this._adminOrderService;
  }

  /**
   *
   */
  get adminInventoryService(): IAdminInventoryService {
    if (!this._adminInventoryService) {
      this._adminInventoryService = new AdminInventoryService(
        this.productRepository,
        this.auditLogService,
      );
    }
    return this._adminInventoryService;
  }

  /**
   *
   */
  get loggerService(): ILoggerService {
    if (!this._loggerService) {
      this._loggerService = new LoggerService();
    }
    return this._loggerService;
  }
}

export const container = ServiceContainer.getInstance();
