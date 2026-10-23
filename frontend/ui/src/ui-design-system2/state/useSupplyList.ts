'use client';

import { useCallback, useMemo, useReducer } from 'react';
import { calculateTotals } from './calculations';
import { PRODUCTS, TRACK_LABELS } from './catalog-data';
import { getPresetItems, supplyListReducer } from './reducer';
import type { SortMode, SupplyTotals, TrackKey } from './types';

export function useSupplyList(initialTrack: TrackKey = 'highschool') {
  const [state, dispatch] = useReducer(supplyListReducer, {
    items: getPresetItems(initialTrack),
    activeTrack: initialTrack,
    activeCategory: 'ALL',
    searchQuery: '',
    sortMode: 'featured',
    eduDiscountActive: true,
  });

  const totals = useMemo<SupplyTotals>(
    () => calculateTotals(state.items, state.eduDiscountActive),
    [state.items, state.eduDiscountActive],
  );

  const filteredProducts = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = PRODUCTS.filter((p) => {
      const matchesCategory = state.activeCategory === 'ALL' || p.category === state.activeCategory;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    if (state.sortMode === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (state.sortMode === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return [...filtered].sort((a, b) => a.index.localeCompare(b.index));
  }, [state.activeCategory, state.searchQuery, state.sortMode]);

  const applyTrackPreset = useCallback((track: TrackKey) => {
    dispatch({ type: 'APPLY_TRACK_PRESET', track });
  }, []);

  const changeQty = useCallback((itemId: string, delta: number) => {
    dispatch({ type: 'CHANGE_QTY', itemId, delta });
  }, []);

  const toggleOwned = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_OWNED', itemId });
  }, []);

  const setCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_CATEGORY', category });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
  }, []);

  const setSortMode = useCallback((sortMode: SortMode) => {
    dispatch({ type: 'SET_SORT_MODE', sortMode });
  }, []);

  const toggleEduDiscount = useCallback(() => {
    dispatch({ type: 'TOGGLE_EDU_DISCOUNT' });
  }, []);

  const clearList = useCallback(() => {
    dispatch({ type: 'CLEAR_LIST' });
  }, []);

  const addCustomItem = useCallback((title: string, price: number) => {
    dispatch({ type: 'ADD_CUSTOM_ITEM', title, price });
  }, []);

  return {
    state,
    totals,
    filteredProducts,
    products: PRODUCTS,
    trackLabels: TRACK_LABELS,
    applyTrackPreset,
    changeQty,
    toggleOwned,
    setCategory,
    setSearchQuery,
    setSortMode,
    toggleEduDiscount,
    clearList,
    addCustomItem,
    dispatch,
  };
}
