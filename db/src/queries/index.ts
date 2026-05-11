// db/queries/index.ts
// Organized query module exports by data domain

// Data domain primitives (reusable across features)
export * from './catalog';
export * from './sales';
export * from './inventory';

// Feature-specific queries (admin operations, school directory, etc.)
export * from './products';
export * from './identity';
export * from './school';
