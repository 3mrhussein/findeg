// Backend package main entry point - re-exports all public interfaces and services

// Core feature exports (shared types, domain models)
export * from "./features/core";

// Identity feature exports (auth, users)
export * from "./features/identity";

// Only export MediaService from media (MediaAsset comes from core to avoid conflicts)
export { MediaService } from "./features/media/application/services";

// Other features - export as they provide their own index.ts
export * from "./features/catalog";
export * from "./features/cart";
export * from "./features/order";
export * from "./features/review";
export * from "./features/school";
export * from "./features/notifications";
export * from "./features/administration";
