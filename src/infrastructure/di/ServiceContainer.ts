import { DrizzleProductRepository } from "../repositories/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "../repositories/DrizzleCategoryRepository";
import { DrizzleUserRepository } from "../repositories/DrizzleUserRepository";
import { DrizzleOrderRepository } from "../repositories/DrizzleOrderRepository";
import { DrizzleReviewRepository } from "../repositories/DrizzleReviewRepository";

/**
 * Service Container
 * 
 * Simple Dependency Injection container to manage singleton instances 
 * of repositories and services.
 */
export class ServiceContainer {
  private static instance: ServiceContainer;

  // Repositories
  private _productRepository?: DrizzleProductRepository;
  private _categoryRepository?: DrizzleCategoryRepository;
  private _userRepository?: DrizzleUserRepository;
  private _orderRepository?: DrizzleOrderRepository;
  private _reviewRepository?: DrizzleReviewRepository;

  private constructor() {}

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  get productRepository(): DrizzleProductRepository {
    if (!this._productRepository) {
      this._productRepository = new DrizzleProductRepository();
    }
    return this._productRepository;
  }

  get categoryRepository(): DrizzleCategoryRepository {
    if (!this._categoryRepository) {
      this._categoryRepository = new DrizzleCategoryRepository();
    }
    return this._categoryRepository;
  }

  get userRepository(): DrizzleUserRepository {
    if (!this._userRepository) {
      this._userRepository = new DrizzleUserRepository();
    }
    return this._userRepository;
  }

  get orderRepository(): DrizzleOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new DrizzleOrderRepository();
    }
    return this._orderRepository;
  }

  get reviewRepository(): DrizzleReviewRepository {
    if (!this._reviewRepository) {
      this._reviewRepository = new DrizzleReviewRepository();
    }
    return this._reviewRepository;
  }
}

export const container = ServiceContainer.getInstance();
