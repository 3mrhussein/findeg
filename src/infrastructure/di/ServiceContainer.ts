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

import { CookieSessionProvider } from "../auth/CookieSessionProvider";

import { AuthService } from "@/application/services/AuthService";
import { ProductService } from "@/application/services/ProductService";
import { CategoryService } from "@/application/services/CategoryService";
import { CartService } from "@/application/services/CartService";
import { AdminProductService } from "@/application/services/AdminProductService";
import { AdminCategoryService } from "@/application/services/AdminCategoryService";
import { AdminDashboardService } from "@/application/services/AdminDashboardService";

import { IProductRepository } from "@/application/repositories/IProductRepository";
import { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import { IUserRepository } from "@/application/repositories/IUserRepository";
import { IOrderRepository } from "@/application/repositories/IOrderRepository";
import { IReviewRepository } from "@/application/repositories/IReviewRepository";

import {
  IAuthService,
  IProductService,
  ICategoryService,
  ICartService,
  IAdminProductService,
  IAdminCategoryService,
  IAdminDashboardService,
  ISessionProvider,
} from "@/application/services/interfaces";

/**
 *
 */
export class ServiceContainer {
  private static instance: ServiceContainer;

  // ─── 1. Repositories (Data Access) ────────────────────────────────────
  // These provide direct access to the database tables.
  private _productRepository?: IProductRepository;
  private _categoryRepository?: ICategoryRepository;
  private _userRepository?: IUserRepository;
  private _orderRepository?: IOrderRepository;
  private _reviewRepository?: IReviewRepository;

  // ─── 2. Infrastructure Services ───────────────────────────────────────
  // Low-level services like Auth providers, Email senders, Storage, etc.
  private _sessionProvider?: ISessionProvider;

  // ─── 3. Application Services (Shop / Customer) ────────────────────────
  // Business logic for the public-facing shop.
  private _authService?: IAuthService;
  private _productService?: IProductService;
  private _categoryService?: ICategoryService;
  private _cartService?: ICartService;

  // ─── 4. Admin Services (Back-office) ──────────────────────────────────
  // Business logic for the admin dashboard.
  private _adminProductService?: IAdminProductService;
  private _adminCategoryService?: IAdminCategoryService;
  private _adminDashboardService?: IAdminDashboardService;

  /**
   *
   */
  private constructor() {}

  /**
   * Get the singleton instance of the container.
   * This ensures we only have one set of services/repositories application-wide.
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

  // ============================================================================
  //  3. APPLICATION SERVICES (Shop Facing)
  //  These inject the repositories above into the service logic.
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
  //  Specialized services for admin operations (usually with more permissions).
  // ============================================================================

  /**
   *
   */
  get adminProductService(): IAdminProductService {
    if (!this._adminProductService) {
      this._adminProductService = new AdminProductService(this.productRepository);
    }
    return this._adminProductService;
  }

  /**
   *
   */
  get adminCategoryService(): IAdminCategoryService {
    if (!this._adminCategoryService) {
      this._adminCategoryService = new AdminCategoryService(this.categoryRepository);
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
      );
    }
    return this._adminDashboardService;
  }
}

export const container = ServiceContainer.getInstance();
