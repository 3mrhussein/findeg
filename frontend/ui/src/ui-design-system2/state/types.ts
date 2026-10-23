export type Category = 'ALL' | 'PAPER' | 'WRITING' | 'DRAFTING';

export type TrackKey = 'highschool' | 'stem' | 'studio' | 'all' | 'custom';

export type SortMode = 'featured' | 'price-asc' | 'price-desc';

export interface SupplyItem {
  id: string;
  index: string;
  title: string;
  category: 'PAPER' | 'WRITING' | 'DRAFTING';
  badge: string;
  price: number;
  specs: string;
  tracks: Array<'highschool' | 'stem' | 'studio'>;
  svgType: 'journal' | 'pens' | 'highlighters' | 'ruler' | 'pencil' | 'tabs' | 'case' | 'calc';
}

export interface SupplyListEntry {
  id: string;
  title: string;
  price: number;
  qty: number;
  owned: boolean;
  isCustom?: boolean;
}

export interface SupplyTotals {
  totalQty: number;
  grossSubtotal: number;
  ownedDeduction: number;
  netBeforeDiscount: number;
  eduDiscount: number;
  finalTotal: number;
}

export interface SupplyListState {
  items: Record<string, SupplyListEntry>;
  activeTrack: TrackKey;
  activeCategory: string;
  searchQuery: string;
  sortMode: SortMode;
  eduDiscountActive: boolean;
}

export type SupplyListAction =
  | { type: 'APPLY_TRACK_PRESET'; track: TrackKey }
  | { type: 'CHANGE_QTY'; itemId: string; delta: number }
  | { type: 'TOGGLE_OWNED'; itemId: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SORT_MODE'; sortMode: SortMode }
  | { type: 'TOGGLE_EDU_DISCOUNT' }
  | { type: 'CLEAR_LIST' }
  | { type: 'ADD_CUSTOM_ITEM'; title: string; price: number };
