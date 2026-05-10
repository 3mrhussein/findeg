/**
 * Service Result Type
 *
 * Represents the result of a service operation that may succeed or return metadata
 * for app-layer integration (cache invalidation, redirects, etc.).
 *
 * Backend services return ServiceResult instead of calling Next.js APIs directly.
 * This enables:
 * - Pure TypeScript execution in Node.js
 * - Framework-agnostic business logic
 * - Clear separation of concerns (backend = logic, app-layer = framework integration)
 *
 * @example Success with data
 * const result: ServiceResult<User> = {
 *   success: true,
 *   data: user,
 *   cachePaths: ["/profile", "/settings"]
 * };
 *
 * @example Success with cache metadata
 * const result: ServiceResult<void> = {
 *   success: true,
 *   cacheTags: ["products", "catalog"],
 *   cachePaths: ["/shop", "/categories"]
 * };
 *
 * @example Error is thrown instead of returned
 * throw new NotFoundError("Product", id);
 */
export type ServiceResult<T = void> = {
  success: true;
  data?: T;
  /**
   * Cache paths that should be revalidated.
   * App-layer calls revalidatePath(path) for each path.
   *
   * @example ["/dashboard", "/profile", "/admin/users"]
   */
  cachePaths?: string[];
  /**
   * Cache tags that should be revalidated.
   * App-layer calls revalidateTag(tag) for each tag.
   *
   * @example ["products", "inventory", "catalog"]
   */
  cacheTags?: string[];
  /**
   * Cache config for server queries.
   * App-layer wraps query with: "use cache"; cacheTag(...); cacheLife(...);
   *
   * @example { tags: ["shop"], lifetime: 3600 }
   */
  cacheConfig?: {
    tags: string[];
    lifetime: number; // seconds
  };
};

/**
 * Utility type to extract data type T from ServiceResult<T>
 *
 * @example
 * type UserData = ExtractServiceResultData<ServiceResult<User>>; // User
 */
export type ExtractServiceResultData<T extends ServiceResult<unknown>> =
  T extends ServiceResult<infer U> ? U : never;
