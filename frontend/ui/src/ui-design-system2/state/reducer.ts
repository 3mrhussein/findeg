import { PRODUCTS } from './catalog-data';
import type { SupplyListAction, SupplyListEntry, SupplyListState, TrackKey } from './types';

export function getPresetItems(trackKey: TrackKey): Record<string, SupplyListEntry> {
  const nextList: Record<string, SupplyListEntry> = {};
  PRODUCTS.forEach((p) => {
    if (trackKey === 'all' || p.tracks.includes(trackKey as 'highschool' | 'stem' | 'studio')) {
      nextList[p.id] = {
        id: p.id,
        title: p.title,
        price: p.price,
        qty: 1,
        owned: false,
        isCustom: false,
      };
    }
  });
  return nextList;
}

export function supplyListReducer(
  state: SupplyListState,
  action: SupplyListAction,
): SupplyListState {
  switch (action.type) {
    case 'APPLY_TRACK_PRESET': {
      return {
        ...state,
        activeTrack: action.track,
        items: getPresetItems(action.track),
      };
    }
    case 'CHANGE_QTY': {
      const prod = PRODUCTS.find((p) => p.id === action.itemId);
      const existing = state.items[action.itemId];
      const nextItems = { ...state.items };

      if (!existing && action.delta > 0 && prod) {
        nextItems[action.itemId] = {
          id: prod.id,
          title: prod.title,
          price: prod.price,
          qty: action.delta,
          owned: false,
          isCustom: false,
        };
      } else if (existing) {
        const nextQty = existing.qty + action.delta;
        if (nextQty <= 0) {
          delete nextItems[action.itemId];
        } else {
          nextItems[action.itemId] = {
            ...existing,
            qty: nextQty,
          };
        }
      }
      return {
        ...state,
        items: nextItems,
      };
    }
    case 'TOGGLE_OWNED': {
      const prod = PRODUCTS.find((p) => p.id === action.itemId);
      const existing = state.items[action.itemId];
      const nextItems = { ...state.items };

      if (!existing && prod) {
        nextItems[action.itemId] = {
          id: prod.id,
          title: prod.title,
          price: prod.price,
          qty: 1,
          owned: true,
          isCustom: false,
        };
      } else if (existing) {
        nextItems[action.itemId] = {
          ...existing,
          owned: !existing.owned,
        };
      }
      return {
        ...state,
        items: nextItems,
      };
    }
    case 'SET_CATEGORY': {
      return {
        ...state,
        activeCategory: action.category,
      };
    }
    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        searchQuery: action.query,
      };
    }
    case 'SET_SORT_MODE': {
      return {
        ...state,
        sortMode: action.sortMode,
      };
    }
    case 'TOGGLE_EDU_DISCOUNT': {
      return {
        ...state,
        eduDiscountActive: !state.eduDiscountActive,
      };
    }
    case 'CLEAR_LIST': {
      return {
        ...state,
        items: {},
        activeTrack: 'custom',
      };
    }
    case 'ADD_CUSTOM_ITEM': {
      const customId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const cleanTitle = action.title.trim().toUpperCase();
      const cleanPrice = isNaN(action.price) || action.price < 0 ? 5.0 : action.price;
      return {
        ...state,
        activeTrack: 'custom',
        items: {
          ...state.items,
          [customId]: {
            id: customId,
            title: cleanTitle,
            price: cleanPrice,
            qty: 1,
            owned: false,
            isCustom: true,
          },
        },
      };
    }
    default:
      return state;
  }
}
