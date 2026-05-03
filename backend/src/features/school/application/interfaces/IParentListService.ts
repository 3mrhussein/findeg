import { SchoolProfile } from './ISchoolDirectoryService';
import { AccessState } from './ISchoolAccessService';

export type SessionState = 'first_visit' | 'has_session' | 'completed_order';

export interface SessionSummary {
  swappedItemsCount: number;
  removedOptionalItemsCount: number;
  totalItems: number;
  totalAmount: number;
}

export interface SchoolListPageData {
  list: SchoolProfile;
  accessState: AccessState;
  sessionState: SessionState;
  fullList: SchoolProfile; // For now, refine later if fullList has more than SchoolProfile
}

export interface IParentListService {
  /**
   * Get the full list with all items, alternatives, and variant data.
   */
  getListWithDetails(slug: string): Promise<SchoolProfile | null>; 

  /**
   * Determine the current session state for a user/guest.
   */
  getSessionState(listId: number, userId?: number, sessionToken?: string): Promise<SessionState>;

  /**
   * Get a plain-language summary of the session changes.
   */
  getSessionSummary(sessionId: number): Promise<SessionSummary>;

  /**
   * Save a brand selection (swap).
   */
  saveItemSelection(sessionId: number, itemId: number, variantId: number): Promise<void>;

  /**
   * Toggle an optional item's inclusion.
   */
  toggleOptionalItem(sessionId: number, itemId: number, include: boolean): Promise<void>;

  /**
   * Reset session to school defaults.
   */
  resetToDefaults(sessionId: number): Promise<void>;

  /**
   * Add the list (kit) to the cart.
   */
  addListToCart(sessionId: number, cartId: number): Promise<void>;

  /**
   * Orchestrates the retrieval of all data required for the school list page.
   */
  getSchoolListPageData(slug: string, userId?: number): Promise<SchoolListPageData | null>;
}
