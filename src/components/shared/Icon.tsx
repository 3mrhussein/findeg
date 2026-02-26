import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
  Plus,
  Chrome,
  Facebook,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

type IconName =
  | "dashboard"
  | "package"
  | "shoppingCart"
  | "users"
  | "chevronRight"
  | "plus"
  | "google"
  | "facebook";

interface IconProps extends Omit<LucideProps, "name"> {
  name: IconName;
}

const iconMap = {
  dashboard: LayoutDashboard,
  package: Package,
  shoppingCart: ShoppingCart,
  users: Users,
  chevronRight: ChevronRight,
  plus: Plus,
  google: Chrome,
  facebook: Facebook,
} satisfies Record<IconName, ComponentType<LucideProps>>;

/**
 *
 */
export function Icon({ name, ...props }: IconProps) {
  const Component = iconMap[name];
  return <Component {...props} />;
}
