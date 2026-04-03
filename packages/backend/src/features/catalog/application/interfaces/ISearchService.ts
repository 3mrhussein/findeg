import { type ID } from "@/features/core/domain/types/common";
import { type Locale } from "@/features/core/domain/value-objects";
import { type Product } from "../../domain/entities/Product";

export interface SearchParams {
  query: string;
  locale: Locale;
  categoryId?: ID;
  brandId?: ID;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  limit?: number;
  offset?: number;
  page?: number;
}

export interface SearchResult {
  items: Product[];
  total: number;
}

export interface Suggestion {
  id: ID;
  name: string;
  slug?: string;
  type: "product" | "category";
  imageUrl?: string;
}

export interface SuggestResult {
  products: Suggestion[];
  categories: Suggestion[];
}

export interface ParsedQuery {
  arabicTerms: string[];
  englishTerms: string[];
  original: string;
}

export interface ISearchService {
  /**
   * Performs a comprehensive, scored, and filtered full-text search.
   */
  search(params: SearchParams): Promise<SearchResult>;

  /**
   * Provides fast, prefix-based autocomplete suggestions.
   */
  suggest(query: string, locale: Locale): Promise<SuggestResult>;

  /**
   * Splits a search query into Arabic and non-Arabic segments.
   */
  parseQuery(query: string): ParsedQuery;
}
