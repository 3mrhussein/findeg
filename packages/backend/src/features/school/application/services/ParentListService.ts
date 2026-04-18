import {
  IParentListService,
  SessionState,
  SessionSummary,
} from "@backend/features/school/application/interfaces/IParentListService";
import { IParentSessionRepository } from "@backend/features/school/application/interfaces/IParentSessionRepository";
import { ISchoolDirectoryService } from "@backend/features/school/application/interfaces/ISchoolDirectoryService";
import {
  schoolLists,
  schoolListItems,
} from "@backend/features/core/infrastructure/persistence/schema/school-lists";
import { schoolListParentSessions } from "@backend/features/core/infrastructure/persistence/schema/school-list-sessions";

/**
 *
 */
export class ParentListService implements IParentListService {
  /**
   *
   */
  constructor(
    private sessionRepo: IParentSessionRepository,
    private schoolListService: ISchoolDirectoryService,
    // private cartService: ICartService
  ) {}

  /**
   *
   */
  async getListWithDetails(slug: string): Promise<any> {
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
      const hasOrder = await this.sessionRepo.hasCompletedOrder(listId, userId);
      if (hasOrder) return "completed_order";
    }

    const session = await this.sessionRepo.getSession(listId, userId, sessionToken);
    if (session) return "has_session";

    return "first_visit";
  }

  /**
   *
   */
  async getSessionSummary(sessionId: number): Promise<SessionSummary> {
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
  async saveItemSelection(sessionId: number, itemId: number, variantId: number): Promise<void> {
    // Fetch existing session selections and update
    // sessionRepo.upsertSession(...)
  }

  /**
   *
   */
  async toggleOptionalItem(sessionId: number, itemId: number, include: boolean): Promise<void> {
    // Update optionalInclusions/Exclusions arrays
  }

  /**
   *
   */
  async resetToDefaults(sessionId: number): Promise<void> {
    // Update session with empty selections and optionals
  }

  /**
   *
   */
  async addListToCart(sessionId: number, cartId: number): Promise<void> {
    // 1. Fetch list items + session overrides
    // 2. Create cart_kit record
    // 3. Add items to cart with cart_kit_id
  }
}
