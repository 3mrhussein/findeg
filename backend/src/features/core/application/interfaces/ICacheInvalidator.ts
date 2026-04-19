/**
 * Cache Invalidation Interface (Optional Pattern)
 *
 * Alternative to returning cache metadata in ServiceResult.
 * Allows services to optionally notify cache invalidation without explicit returns.
 *
 * Currently: Backend services return cache metadata in ServiceResult
 * Future: Could use observer pattern if needed for notification-based cache updates
 *
 * This interface is kept as a contract for future evolution but is not
 * actively used in the current refactoring.
 */
export interface ICacheInvalidator {
  /**
   * Notifies that specific cache paths should be invalidated.
   *
   * @param paths - Array of absolute paths to invalidate
   */
  invalidatePaths(paths: string[]): Promise<void>;

  /**
   * Notifies that specific cache tags should be invalidated.
   *
   * @param tags - Array of cache tags to invalidate
   */
  invalidateTags(tags: string[]): Promise<void>;

  /**
   * Notifies multiple invalidations at once.
   *
   * @param options - Paths and/or tags to invalidate
   */
  invalidate(options: {
    paths?: string[];
    tags?: string[];
  }): Promise<void>;
}
