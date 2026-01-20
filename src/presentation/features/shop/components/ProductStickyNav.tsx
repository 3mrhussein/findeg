'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/presentation/shared/layout/Container';
import { useTranslations } from 'next-intl';

interface ProductStickyNavProps {
  offsetTop: number;
}

export const ProductStickyNav: React.FC<ProductStickyNavProps> = ({ offsetTop }) => {
  const t = useTranslations();
  const [isNavSticky, setIsNavSticky] = useState(false);

  const navItems = [
    { label: t('Pages.ProductDetail.NavDescription'), href: '#description' },
    { label: t('Pages.ProductDetail.NavReviews'), href: '#reviews' },
    { label: t('Pages.ProductDetail.NavRecommended'), href: '#recommended' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSticky(window.scrollY > offsetTop);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offsetTop]);

  return (
    <div className={`sticky top-[73px] bg-card/80 backdrop-blur-lg z-30 shadow-sm transition-all duration-300 ${isNavSticky ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
      <Container>
        <div className="flex items-center justify-center border-b border-border">
          {navItems.map(item => (
            <a key={item.href} href={item.href} className="px-6 py-4 font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200">
              {item.label}
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
};
