/**
 * Types Package Exports
 * 
 * Central export point for validation schemas.
 * Domain types are exported from their respective features to avoid conflicts.
 * 
 * Import validation schemas: import { CreateUserSchema } from '@findeg/backend/types'
 * Import domain types: import { User, Product } from '@findeg/backend'
 */

// Validation schemas only (domain types exported from features)
export * from './validation';
