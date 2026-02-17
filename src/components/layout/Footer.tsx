"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon, IconName } from "@/components/common/Icon";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterUIProps {
  onSettingsClick: () => void;
  tagline: string;
  shopTitle: string;
  aboutTitle: string;
  followTitle: string;
  copyrightText: string;
  cookieSettingsText: string;
  shopLinks: FooterLink[];
  aboutLinks: FooterLink[];
}

/**
 *
 */
export const FooterUI: React.FC<FooterUIProps> = ({
  onSettingsClick,
  tagline,
  shopTitle,
  aboutTitle,
  followTitle,
  copyrightText,
  cookieSettingsText,
  shopLinks,
  aboutLinks,
}) => {
  const currentYear = new Date().getFullYear();
  const socialLinks: { name: IconName; href: string; label: string }[] = [
    { name: "facebook", href: "#", label: "Facebook" },
    { name: "instagram", href: "#", label: "Instagram" },
    { name: "twitter", href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-white/80">{tagline}</p>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">{shopTitle}</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">{aboutTitle}</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-lg mb-4">{followTitle}</h4>
            <div className="flex space-x-4">
              {socialLinks.map(({ name, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Icon name={name} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-center text-white/70">
          <p>
            &copy; {currentYear} FindEg.com. {copyrightText}
          </p>
          <Button
            variant="link"
            onClick={onSettingsClick}
            className="text-white/70 hover:text-white mt-4 sm:mt-0 px-0"
          >
            {cookieSettingsText}
          </Button>
        </div>
      </div>
    </footer>
  );
};

interface FooterProps {
  onSettingsClick: () => void;
}
/**
 *
 */
export const Footer: React.FC<FooterProps> = ({ onSettingsClick }) => {
  const t = useTranslations();

  const shopLinks: FooterLink[] = [
    { label: t("Nav.Shop"), href: "/shop" },
    { label: t("Nav.Categories"), href: "/categories" },
    { label: t("Nav.SchoolLists"), href: "/school-lists" },
    { label: t("Pages.Home.Featured.Title"), href: "/shop" },
  ];
  const aboutLinks: FooterLink[] = [
    { label: t("Layout.Footer.AboutStory"), href: "/about" },
    { label: t("Layout.Footer.AboutContact"), href: "/about" },
    { label: t("Layout.Footer.ShopTitle"), href: "/shop" },
    { label: t("Layout.Footer.AboutTitle"), href: "/brand-kit" },
  ];

  return (
    <FooterUI
      onSettingsClick={onSettingsClick}
      tagline={t("Layout.Footer.Tagline")}
      shopTitle={t("Layout.Footer.ShopTitle")}
      aboutTitle={t("Layout.Footer.AboutTitle")}
      followTitle={t("Layout.Footer.FollowTitle")}
      copyrightText={t("Layout.Footer.Copyright")}
      cookieSettingsText={t("Layout.Footer.CookieSettings")}
      shopLinks={shopLinks}
      aboutLinks={aboutLinks}
    />
  );
};
