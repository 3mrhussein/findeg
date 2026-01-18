'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/presentation/components/server/layout/Container';
import { useTranslation } from '@/presentation/hooks';

interface ProductStickyNavProps {
  offsetTop: number;
}

export const ProductStickyNav: React.FC<ProductStickyNavProps> = ({ offsetTop }) => {
  const { t } = useTranslation();
  const [isNavSticky, setIsNavSticky] = useState(false);

  const navItems = [
    { key: 'product_nav_description', href: '#description' },
    { key: 'product_nav_reviews', href: '#reviews' },
    { key: 'product_nav_recommended', href: '#recommended' },
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
            <a key={item.key} href={item.href} className="px-6 py-4 font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200">
              {t(item.key as any)}
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
};
