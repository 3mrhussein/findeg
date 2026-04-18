/**
 * UI / Presentation Types
 *
 * Types used by the presentation layer (components, hooks, providers).
 * These are NOT domain types — they describe UI concerns like navigation,
 * view modes, and theme preferences.
 *
 * Domain entities (Product, Category, User, etc.) live in src/domain/entities/.
 */

import React from "react";
import type { Locale } from "@backend/features/core";
export type {
  NavigationSubLink,
  NavigationLink,
  MegaMenuColumn,
  NavigationItem,
  Theme,
  SortOption,
  ViewMode,
  ClientUser as User,
  ClientUser
} from "@ui";

export type Language = Locale;

