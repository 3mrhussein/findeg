// Backend package main entry point: infrastructure, composition and session token adapters.
// Identity, Catalog and Orders are published by their own packages.
import { createIdentityServices } from '@findeg/identity';
import { createOrders } from '@findeg/orders';
import { createProductService } from './features/catalog';
import { parse } from './features/core';

export * from './features/core';

export {
  JWTService,
  type TokenPair,
  type JWTPayload,
  type TokenType,
  type IJWTService,
} from './features/core/infrastructure/auth/JwtTokenService';

export { login, logout, updateMyProfile, updateProfile, getMyAccountData } from '@findeg/identity';

/** Aggregates the products, Orders and account for the customer dashboard. */
export async function getDashboardData(locale: string, userId: number) {
  const { userService } = createIdentityServices();
  const products = createProductService();
  const orders = createOrders();
  const resolvedLocale = parse(locale);
  const [allProducts, userOrders, user] = await Promise.all([
    products.getAll(resolvedLocale),
    orders.listForCustomer(userId),
    userService.getAdmin(userId),
  ]);

  return { products: allProducts, orders: userOrders, session: user };
}

export { MediaService } from './features/media/application/services';

// Shared libraries
export * from './lib';
