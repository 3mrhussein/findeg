/**
 * UI / Presentation Types
 *
 * Types used by the presentation layer (components, hooks, providers).
 * These are NOT domain types — they describe UI concerns like navigation,
 * view modes, and theme preferences.
 *
 * Domain entities (Product, Category, User, etc.) live in src/domain/entities/.
 */

export type {
  NavigationSubLink,
  NavigationLink,
  MegaMenuColumn,
  NavigationItem,
  Theme,
  SortOption,
  ViewMode,
  ClientUser as User,
  ClientUser,
} from '@findeg/ui';
