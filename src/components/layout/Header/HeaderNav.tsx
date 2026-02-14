"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { Badge } from "@/components/ui/badge";
import type { NavigationItem } from "@/lib/types";
import { useRouter } from "@/i18n/routing";

interface NavLinkProps {
  item: NavigationItem;
  onClick: () => void;
  t: (key: any) => string;
}

/**
 *
 */
const NavLink: React.FC<NavLinkProps> = ({ item, onClick, t }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const router = useRouter();

  /**
   *
   */
  const handleClick = (e: React.MouseEvent, href: string) => {
    if (item.id === "nav_ai_generator") {
      e.preventDefault();
      router.push("/");
      setTimeout(() => {
        document.querySelector("#ai-generator")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    onClick();
  };

  if (item.isMegaMenu) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsMegaMenuOpen(true)}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <Link
          href={item.href}
          onClick={(e) => handleClick(e, item.href)}
          className="relative text-foreground hover:text-primary transition-colors font-medium group text-lg md:text-base flex items-center gap-1"
        >
          {item.labelKey}{" "}
          <Icon
            name="chevronDown"
            className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
          />
        </Link>
        {isMegaMenuOpen && (
          <div className="absolute top-full ltr:left-1/2 rtl:right-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 mt-2 w-max max-w-4xl bg-card rounded-lg shadow-lg border p-6 z-50">
            <div className="grid grid-cols-3 gap-x-12 gap-y-6">
              {item.megaMenuColumns?.map((col) => (
                <div key={col.titleKey}>
                  <h4 className="font-bold text-card-foreground mb-4">{t(col.titleKey)}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.labelKey}>
                        <Link
                          href={link.href}
                          onClick={(e) => handleClick(e, link.href)}
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          {t(link.labelKey)}
                          {link.isNew && (
                            <Badge variant="default" className="ltr:ml-2 rtl:mr-2">
                              NEW
                            </Badge>
                          )}
                        </Link>
                        {link.subLinks && (
                          <ul className="ltr:pl-4 rtl:pr-4 mt-2 space-y-2 border-l-2 border-border ltr:border-l-primary rtl:border-r-primary">
                            {link.subLinks.map((sub) => (
                              <li key={sub.labelKey}>
                                <Link
                                  href={sub.href}
                                  onClick={(e) => handleClick(e, sub.href)}
                                  className="flex items-center gap-2 text-sm text-muted-foreground/80 hover:text-primary"
                                >
                                  {sub.icon} {t(sub.labelKey)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={(e) => handleClick(e, item.href)}
      className="relative text-foreground hover:text-primary transition-colors font-medium group text-lg md:text-base"
    >
      {item.labelKey}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
};

interface HeaderNavProps {
  items: NavigationItem[];
  onItemClick?: () => void;
}

/**
 *
 */
export const HeaderNav: React.FC<HeaderNavProps> = ({ items, onItemClick = () => {} }) => {
  const t = useTranslations();
  return (
    <nav className="hidden md:flex items-center gap-8">
      {items.map((item) => (
        <NavLink key={item.labelKey} item={item} onClick={onItemClick} t={t} />
      ))}
    </nav>
  );
};
