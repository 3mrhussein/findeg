// ========================================
// DOMAIN LAYER EXPORTS
// ========================================
export * from './domain/entities/Review';

// ========================================
// APPLICATION LAYER EXPORTS
// ========================================
export * from './application/interfaces/IReviewRepository';
export * from './application/interfaces/IReviewService';
export * from './application/services/ReviewService';
export * from './application/services/factory';

// ========================================
// INFRASTRUCTURE EXPORTS REMOVED
// ========================================
// DrizzleReviewRepository is an infrastructure implementation.
// Apps should depend on IReviewRepository and ReviewService instead.
