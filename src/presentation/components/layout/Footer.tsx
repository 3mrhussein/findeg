'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/presentation/components/shared/Logo';
import { useTranslation } from '@/presentation/hooks';
import { Button } from '@/presentation/components/ui/button';
import { Icon, IconName } from '@/presentation/components/shared/Icon';

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

export const FooterUI: React.FC<FooterUIProps> = ({ 
    onSettingsClick,
    tagline,
    shopTitle,
    aboutTitle,
    followTitle,
    copyrightText,
    cookieSettingsText,
    shopLinks,
    aboutLinks
}) => {
  const socialLinks: { name: IconName, href: string, label: string }[] = [
    { name: 'facebook', href: '#', label: 'Facebook' },
    { name: 'instagram', href: '#', label: 'Instagram' },
    { name: 'twitter', href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-white/80">
              {tagline}
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">{shopTitle}</h4>
            <ul className="space-y-2">
              {shopLinks.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">{aboutTitle}</h4>
            <ul className="space-y-2">
               {aboutLinks.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
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
                 <a key={label} href={href} aria-label={label} className="text-white/80 hover:text-white transition-colors">
                   <Icon name={name} className="w-6 h-6" />
                 </a>
               ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-center text-white/70">
          <p>&copy; 2024 FindEg.com. {copyrightText}</p>
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
export const Footer: React.FC<FooterProps> = ({ onSettingsClick }) => {
    const { t } = useTranslation();

    const shopLinks: FooterLink[] = [
        { label: t('nav_shop'), href: '/shop' },
        { label: t('nav_categories'), href: '/categories' },
        { label: t('featured_products_title'), href: '/shop' },
    ];
    const aboutLinks: FooterLink[] = [
        { label: t('footer_about_story'), href: '/about' },
        { label: t('footer_about_contact'), href: '/about' },
        { label: t('faq_title'), href: '/shop' },
        { label: t('nav_brand_kit'), href: '/brand-kit' }
    ];

    return (
        <FooterUI
            onSettingsClick={onSettingsClick}
            tagline={t('footer_tagline')}
            shopTitle={t('footer_shop_title')}
            aboutTitle={t('footer_about_title')}
            followTitle={t('footer_follow_title')}
            copyrightText={t('footer_copyright')}
            cookieSettingsText={t('footer_cookie_settings')}
            shopLinks={shopLinks}
            aboutLinks={aboutLinks}
        />
    );
};