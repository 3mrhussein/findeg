'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../molecules/Logo';
import {
  navigationSchema,
} from '@/lib/navigation';
import { Button } from '../ui/button';
import type { NavigationItem, Theme } from '@/types';
import { CartDrawer } from './CartDrawer';
import { Badge } from '../atoms/Badge';
import { IndicatorCircle } from '../atoms/IndicatorCircle';
import { useTranslation, useTheme, useCart, useUser } from '@/hooks';
import { Icon } from '../atoms/Icon';
import { Input } from '../ui/input';

interface LanguageSwitcherProps {
    language: string;
    onToggleLanguage: () => void;
}
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onToggleLanguage }) => {
    return (
        <Button variant="ghost" onClick={onToggleLanguage} size="sm">
            {language === 'en' ? 'AR' : 'EN'}
        </Button>
    );
};

interface ThemeSwitcherProps {
    theme: Theme;
    onToggleTheme: () => void;
}
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggleTheme }) => {
    return (
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-6 h-6" />
        </Button>
    );
};

interface NavLinkProps {
    item: NavigationItem;
    onClick: () => void;
    t: (key: any) => string;
}
const NavLink: React.FC<NavLinkProps> = ({ item, onClick, t }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (item.labelKey === 'nav_ai_generator') {
        e.preventDefault();
        router.push('/');
        setTimeout(() => {
            document.querySelector('#ai-generator')?.scrollIntoView({ behavior: 'smooth' });
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
          {t(item.labelKey)} <Icon name="chevronDown" className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
        </Link>
        {isMegaMenuOpen && (
          <div className="absolute top-full ltr:left-1/2 rtl:right-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 mt-2 w-max max-w-4xl bg-card rounded-lg shadow-lg border p-6 z-50">
            <div className="grid grid-cols-3 gap-x-12 gap-y-6">
              {item.megaMenuColumns?.map(col => (
                <div key={col.titleKey}>
                  <h4 className="font-bold text-card-foreground mb-4">{t(col.titleKey)}</h4>
                  <ul className="space-y-3">
                    {col.links.map(link => (
                      <li key={link.labelKey}>
                        <Link 
                          href={link.href} 
                          onClick={(e) => handleClick(e, link.href)} 
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          {t(link.labelKey)}
                          {link.isNew && <Badge variant="primary" className="ltr:ml-2 rtl:mr-2">NEW</Badge>}
                        </Link>
                        {link.subLinks && (
                          <ul className="ltr:pl-4 rtl:pr-4 mt-2 space-y-2 border-l-2 border-border ltr:border-l-primary rtl:border-r-primary">
                            {link.subLinks.map(sub => (
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
      {t(item.labelKey)}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
};


interface HeaderUIProps {
    handleSearch: (query: string) => void;
    t: (key: any, options?: { [key: string]: string | number }) => string;
    language: string;
    onToggleLanguage: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    cartCount: number;
    isCartOpen: boolean;
    onToggleCart: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
}

/**
 * The main header component for the application.
 * 
 * This component includes the logo, navigation menu, search bar, theme switcher,
 * language switcher, cart button, and user account controls. It handles responsive
 * design with a mobile menu drawer.
 * 
 * @param {HeaderUIProps} props - The component props.
 */
export const HeaderUI: React.FC<HeaderUIProps> = ({ 
    handleSearch,
    t,
    language,
    onToggleLanguage,
    theme,
    onToggleTheme,
    cartCount,
    isCartOpen,
    onToggleCart,
    isLoggedIn,
    onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
      setSearchQuery('');
      if(isMenuOpen) setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isCartOpen ? 'hidden' : 'auto';
  }, [isMenuOpen, isCartOpen]);

  const mainNavItems = navigationSchema.filter(item => isLoggedIn || (item.href !== '/my-account' && item.href !== '/dashboard'));

  return (
    <>
      <header className="bg-card/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex w-full justify-between items-center py-4 gap-4">
            <div className="flex-shrink-0">
                <Logo />
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              {mainNavItems.map(item => <NavLink key={item.labelKey} item={item} onClick={() => setIsMenuOpen(false)} t={t} />)}
            </nav>
            
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex">
                <form onSubmit={onSearchSubmit} className="relative">
                    <Input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-32 lg:w-48 bg-muted border-transparent h-9 rounded-full ltr:pl-4 rtl:pr-4 ltr:pr-10 rtl:pl-10 text-sm transition-all duration-300 focus:w-48 lg:focus:w-64"
                    />
                    <Button size="icon" variant="ghost" type="submit" className="absolute top-1/2 -translate-y-1/2 ltr:right-0 rtl:left-0 h-9 w-9 text-muted-foreground hover:text-primary" aria-label="Search">
                        <Icon name="search" className="w-5 h-5" />
                    </Button>
                </form>
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
                <LanguageSwitcher language={language} onToggleLanguage={onToggleLanguage} />
              </div>
               <Button variant="ghost" size="icon" onClick={onToggleCart} className="relative" aria-label={t('header_cart_button')}>
                <Icon name="shoppingCart" className="w-6 h-6 text-foreground" />
                {cartCount > 0 && <IndicatorCircle count={cartCount} />}
              </Button>
               <div className="hidden sm:flex items-center gap-2">
                {!isLoggedIn ? (
                  <>
                    <Button variant="ghost" onClick={() => router.push('/registration')}>
                        {t('header_signin_button')}
                    </Button>
                    <Button onClick={() => router.push('/registration')}>
                        {t('header_signup_button')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={onLogout}>
                        {t('my_account_logout')}
                    </Button>
                  </>
                )}
              </div>
              
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                    <Icon name="menu" className="w-6 h-6 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-card z-50 transform ${isMenuOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="container mx-auto px-4 flex flex-col h-full">
            <div className="flex justify-between items-center py-4 border-b">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                    <Icon name="x" className="w-6 h-6 text-foreground" />
                </Button>
            </div>
            <div className="p-4">
              <form onSubmit={onSearchSubmit} className="w-full relative">
                  <Input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search_placeholder')}
                      className="rounded-full ltr:pr-12 rtl:pl-12 h-11"
                  />
                  <Button size="icon" variant="ghost" type="submit" className="absolute top-1/2 -translate-y-1/2 ltr:right-1 rtl:left-1 text-muted-foreground" aria-label="Search">
                      <Icon name="search" className="w-6 h-6" />
                  </Button>
              </form>
            </div>
            <nav className="flex flex-col items-start space-y-6 p-4">
                {mainNavItems.map(item => <NavLink key={item.labelKey} item={item} onClick={() => setIsMenuOpen(false)} t={t} />)}
            </nav>
            <div className="mt-auto p-4 border-t">
                <div className="flex justify-around items-center mb-4">
                    <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
                    <LanguageSwitcher language={language} onToggleLanguage={onToggleLanguage} />
                </div>
                {!isLoggedIn ? (
                  <>
                    <Button size="lg" className="w-full" onClick={() => {setIsMenuOpen(false); router.push('/registration');}}>
                        {t('header_signup_button')}
                    </Button>
                    <Button variant="outline" size="lg" className="w-full mt-2" onClick={() => {setIsMenuOpen(false); router.push('/registration');}}>
                        {t('header_signin_button')}
                    </Button>
                  </>
                ) : (
                   <Button variant="outline" size="lg" className="w-full" onClick={() => {setIsMenuOpen(false); onLogout();}}>
                        {t('my_account_logout')}
                    </Button>
                )}
            </div>
        </div>
      </div>
      <CartDrawer />
    </>
  );
};

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { cartCount, isCartOpen, toggleCart } = useCart();
  const { isLoggedIn, logout } = useUser();
  const router = useRouter();

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <HeaderUI
      handleSearch={handleSearch}
      t={t}
      language={language}
      onToggleLanguage={handleToggleLanguage}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      cartCount={cartCount}
      isCartOpen={isCartOpen}
      onToggleCart={toggleCart}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
  );
};