/**
 * Service Interfaces — Barrel Export
 *
 * Import all service interfaces from this single entry point:
 *   import { IProductService, IAuthService } from "@/application/services/interfaces";
 */

// Shop-facing services
export type { IProductService } from "./IProductService";
export type { ICategoryService } from "./ICategoryService";
export type { ICartService } from "./ICartService";

// Admin services
export type { IAdminProductService } from "./IAdminProductService";
export type { IAdminCategoryService } from "./IAdminCategoryService";
export type { IAdminDashboardService } from "./IAdminDashboardService";

// Auth
export type { IAuthService } from "./IAuthService";
export type { ISessionProvider } from "./ISessionProvider";
