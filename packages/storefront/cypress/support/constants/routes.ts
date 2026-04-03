/**
 * Single source of truth for Cypress API/UI routes.
 * Keep all high-churn path segments and endpoint builders here.
 */
export const API_SEGMENTS = {
  root: "/api",
  version: "v1",
} as const;

export const API_BASE = `${API_SEGMENTS.root}/${API_SEGMENTS.version}`;

export const API_ROUTES = {
  authLogin: `${API_BASE}/auth/login`,
  authRegister: `${API_BASE}/auth/register`,
  adminProducts: `${API_BASE}/admin/products`,
  adminProductById: (id: number) => `${API_BASE}/admin/products/${id}`,
  adminCategories: `${API_BASE}/admin/categories`,
  adminCategoryById: (id: number) => `${API_BASE}/admin/categories/${id}`,
  adminBrands: `${API_BASE}/admin/brands`,
  adminBrandById: (id: number) => `${API_BASE}/admin/brands/${id}`,
  adminInventoryByProductId: (productId: number) => `${API_BASE}/admin/inventory/${productId}`,
  cart: `${API_BASE}/cart`,
  cartItems: `${API_BASE}/cart/items`,
  cartItemById: (id: number) => `${API_BASE}/cart/items/${id}`,
  checkoutValidate: `${API_BASE}/checkout/validate`,
  checkoutOrder: `${API_BASE}/checkout/order`,
  products: `${API_BASE}/products`,
  categories: `${API_BASE}/categories`,
} as const;

export const UI_ROUTES = {
  shop: "/shop",
  search: "/search",
  categories: "/categories",
  categoryBySlug: (slug: string) => `/categories/${slug}`,
  checkout: "/checkout",
  myAccount: "/my-account",
  registration: "/registration",
  admin: "/admin",
  adminLogin: "/admin-login",
  adminProducts: "/admin/products",
  adminProductsNew: "/admin/products/new",
  adminProductEditById: (id: number) => `/admin/products/${id}/edit`,
  adminCategories: "/admin/categories",
  adminCategoriesNew: "/admin/categories/new",
  adminCategoryEditById: (id: number) => `/admin/categories/${id}/edit`,
  adminBrands: "/admin/brands",
  adminInventory: "/admin/inventory",
  productById: (id: number) => `/products/${id}`,
} as const;

export const ROUTE_QUERY_KEYS = {
  categories: "categories",
  brands: "brands",
  price: "price",
  sort: "sort",
  page: "page",
  search: "q",
} as const;
