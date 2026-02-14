import React from "react";
import {
  Pen,
  Puzzle,
  Backpack,
  Search,
  MessageSquare,
  Send,
  Mail,
  Phone,
  MapPin,
  LayoutDashboard,
  Package,
  Users,
  Chrome,
  ShoppingCart,
  Wand2,
  Menu,
  X,
  Heart,
  Bookmark,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Grid,
  List,
  Facebook,
  Instagram,
  Twitter,
  Star,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "pen"
  | "puzzle"
  | "backpack"
  | "search"
  | "chat"
  | "send"
  | "mail"
  | "phone"
  | "location"
  | "dashboard"
  | "package"
  | "users"
  | "google"
  | "shoppingCart"
  | "magicWand"
  | "menu"
  | "x"
  | "heart"
  | "bookmark"
  | "sun"
  | "moon"
  | "chevronDown"
  | "chevronRight"
  | "plus"
  | "minus"
  | "trash"
  | "grid"
  | "list"
  | "facebook"
  | "instagram"
  | "twitter"
  | "star";

const iconMap: Record<IconName, LucideIcon> = {
  pen: Pen,
  puzzle: Puzzle,
  backpack: Backpack,
  search: Search,
  chat: MessageSquare,
  send: Send,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  dashboard: LayoutDashboard,
  package: Package,
  users: Users,
  google: Chrome,
  shoppingCart: ShoppingCart,
  magicWand: Wand2,
  menu: Menu,
  x: X,
  heart: Heart,
  bookmark: Bookmark,
  sun: Sun,
  moon: Moon,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  grid: Grid,
  list: List,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  star: Star,
};

/**
 * Renders a Lucide icon based on its name.
 */
export function renderLucideIcon(name: IconName, props: React.ComponentProps<LucideIcon>) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}
