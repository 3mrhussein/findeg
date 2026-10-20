import { describe, expect, it } from 'vitest';
import { supplyListReducer } from './reducer';
import type { SupplyListState } from './types';
import { PRODUCTS } from './catalog-data';

describe('supplyListReducer', () => {
  const getInitialState = (): SupplyListState => ({
    items: {},
    activeTrack: 'highschool',
    activeCategory: 'ALL',
    searchQuery: '',
    sortMode: 'featured',
    eduDiscountActive: true,
  });

  it('handles APPLY_TRACK_PRESET for highschool', () => {
    const state = supplyListReducer(getInitialState(), {
      type: 'APPLY_TRACK_PRESET',
      track: 'highschool',
    });
    expect(state.activeTrack).toBe('highschool');
    const items = Object.values(state.items);
    // high school tracks in catalog
    const hsProducts = PRODUCTS.filter((p) => p.tracks.includes('highschool'));
    expect(items.length).toBe(hsProducts.length);
    items.forEach((item) => {
      expect(item.qty).toBe(1);
      expect(item.owned).toBe(false);
    });
  });

  it('increments item quantity with CHANGE_QTY', () => {
    const initialState = supplyListReducer(getInitialState(), {
      type: 'APPLY_TRACK_PRESET',
      track: 'highschool',
    });
    const state = supplyListReducer(initialState, {
      type: 'CHANGE_QTY',
      itemId: 'b5-journal',
      delta: 1,
    });
    expect(state.items['b5-journal']?.qty).toBe(2);
  });

  it('decrements item quantity and removes when zero', () => {
    const initialState = supplyListReducer(getInitialState(), {
      type: 'APPLY_TRACK_PRESET',
      track: 'highschool',
    });
    const state = supplyListReducer(initialState, {
      type: 'CHANGE_QTY',
      itemId: 'b5-journal',
      delta: -1,
    });
    expect(state.items['b5-journal']).toBeUndefined();
  });

  it('toggles item owned status', () => {
    const initialState = supplyListReducer(getInitialState(), {
      type: 'APPLY_TRACK_PRESET',
      track: 'highschool',
    });
    const state = supplyListReducer(initialState, {
      type: 'TOGGLE_OWNED',
      itemId: 'b5-journal',
    });
    expect(state.items['b5-journal']?.owned).toBe(true);

    const toggledBack = supplyListReducer(state, {
      type: 'TOGGLE_OWNED',
      itemId: 'b5-journal',
    });
    expect(toggledBack.items['b5-journal']?.owned).toBe(false);
  });

  it('updates category filter, search query, and sort mode', () => {
    let state = supplyListReducer(getInitialState(), {
      type: 'SET_CATEGORY',
      category: 'WRITING',
    });
    expect(state.activeCategory).toBe('WRITING');

    state = supplyListReducer(state, {
      type: 'SET_SEARCH_QUERY',
      query: 'gel pen',
    });
    expect(state.searchQuery).toBe('gel pen');

    state = supplyListReducer(state, {
      type: 'SET_SORT_MODE',
      sortMode: 'price-desc',
    });
    expect(state.sortMode).toBe('price-desc');
  });

  it('toggles student EDU discount', () => {
    let state = supplyListReducer(getInitialState(), {
      type: 'TOGGLE_EDU_DISCOUNT',
    });
    expect(state.eduDiscountActive).toBe(false);

    state = supplyListReducer(state, {
      type: 'TOGGLE_EDU_DISCOUNT',
    });
    expect(state.eduDiscountActive).toBe(true);
  });

  it('clears all items with CLEAR_LIST', () => {
    const filledState = supplyListReducer(getInitialState(), {
      type: 'APPLY_TRACK_PRESET',
      track: 'highschool',
    });
    const cleared = supplyListReducer(filledState, { type: 'CLEAR_LIST' });
    expect(Object.keys(cleared.items).length).toBe(0);
    expect(cleared.activeTrack).toBe('custom');
  });

  it('adds a custom item', () => {
    const state = supplyListReducer(getInitialState(), {
      type: 'ADD_CUSTOM_ITEM',
      title: 'Lab Coat',
      price: 25.0,
    });
    const customItems = Object.values(state.items).filter((i) => i.isCustom);
    expect(customItems.length).toBe(1);
    expect(customItems[0]?.title).toBe('LAB COAT');
    expect(customItems[0]?.price).toBe(25.0);
    expect(state.activeTrack).toBe('custom');
  });
});
