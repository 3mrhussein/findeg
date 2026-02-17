"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import type { NavigationItem } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderNavProps {
  items: NavigationItem[];
  onItemClick?: () => void;
}

function NavMegaMenu({
  item,
  onItemClick,
  t,
}: {
  item: NavigationItem;
  onItemClick: () => void;
  t: (key: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 text-base font-medium text-foreground transition-colors hover:text-primary">
        {t(item.labelKey)}
        <Icon name="chevronDown" className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {item.megaMenuColumns?.map((column, index) => (
          <div key={column.titleKey}>
            <DropdownMenuLabel>{t(column.titleKey)}</DropdownMenuLabel>
            {column.links.map((link) => (
              <DropdownMenuItem key={link.labelKey} asChild>
                <Link href={link.href} onClick={onItemClick} className="w-full cursor-pointer">
                  {t(link.labelKey)}
                </Link>
              </DropdownMenuItem>
            ))}
            {index < (item.megaMenuColumns?.length ?? 0) - 1 ? <DropdownMenuSeparator /> : null}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderNav({ items, onItemClick = () => {} }: HeaderNavProps) {
  const t = useTranslations();
  const translate = (key: string) => t(key as never);

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) =>
        item.isMegaMenu ? (
          <NavMegaMenu key={item.labelKey} item={item} onItemClick={onItemClick} t={translate} />
        ) : (
          <Link
            key={item.labelKey}
            href={item.href}
            onClick={onItemClick}
            className="text-base font-medium text-foreground transition-colors hover:text-primary"
          >
            {translate(item.labelKey)}
          </Link>
        ),
      )}
    </nav>
  );
}
