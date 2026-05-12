
import {
  ISchoolDirectoryService,
  SchoolProfile,
} from '@findeg/backend/features/school/application/interfaces/ISchoolDirectoryService';
import { ISchoolAccessService } from '@findeg/backend/features/school/application/interfaces/ISchoolAccessService';
import { IParentListService, SchoolListPageData, SessionState, SessionSummary } from '../interfaces/IParentListService';
import { sessionQueries } from '@findeg/db/queries';

/**
 *
 */
export class ParentListService implements IParentListService {
  /**
   *
   */
  constructor(
    private schoolListService: ISchoolDirectoryService,
    private accessService: ISchoolAccessService,
  ) { }

  /**
   *
   */
  async getListWithDetails(slug: string): Promise<SchoolProfile | null> {
    // This will call the existing schoolListService or list repository
    // We need to fetch items + alternatives + variant data (price, stock, image)
    const list = await this.schoolListService.getBySlug(slug);
    if (!list) return null;

    // TODO: Enhance list with items and alternatives including variant data
    return list;
  }

  /**
   *
   */
  async getSessionState(
    listId: number,
    userId?: number,
    sessionToken?: string,
  ): Promise<SessionState> {
    if (userId) {
      const hasOrder = await sessionQueries.hasCompletedOrder(listId, userId);
      if (hasOrder) return 'completed_order';
    }

    const session = await sessionQueries.getSession(listId, userId, sessionToken);
    if (session) return 'has_session';

    return 'first_visit';
  }

  /**
   *
   */
  async getSessionSummary(_sessionId: number): Promise<SessionSummary> {
    // Fetch session and list items to calculate summary
    // This is a placeholder summary
    return {
      swappedItemsCount: 0,
      removedOptionalItemsCount: 0,
      totalItems: 0,
      totalAmount: 0,
    };
  }

  /**
   *
   */
  async saveItemSelection(_sessionId: number, _itemId: number, _variantId: number): Promise<void> {
    // Fetch existing session selections and update
    // sessionRepo.upsertSession(...)
  }

  /**
   *
   */
  async toggleOptionalItem(_sessionId: number, _itemId: number, _include: boolean): Promise<void> {
    // Update optionalInclusions/Exclusions arrays
  }

  /**
   *
   */
  async resetToDefaults(_sessionId: number): Promise<void> {
    // Update session with empty selections and optionals
  }

  /**
   *
   */
  async addListToCart(_sessionId: number, _cartId: number): Promise<void> {
    // 1. Fetch list items + session overrides
    // 2. Create cart_kit record
    // 3. Add items to cart with cart_kit_id
  }

  /**
   * Orchestrates the retrieval of all data required for the school list page.
   */
  async getSchoolListPageData(slug: string, userId?: number): Promise<SchoolListPageData | null> {
    const list = await this.schoolListService.getBySlug(slug);
    if (!list) return null;

    const [accessState, sessionState, fullList] = await Promise.all([
      this.accessService.getAccessState(list.id, userId || null),
      this.getSessionState(list.id, userId),
      this.getListWithDetails(slug),
    ]);

    return {
      list,
      accessState,
      sessionState,
      fullList: fullList as SchoolProfile,
    };
  }
}
