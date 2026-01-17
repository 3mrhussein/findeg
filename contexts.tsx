import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Theme, Language, CartItem, Product, User } from './types';
import { translations } from './i18n';

// --- Theme Context ---
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- I18n Context ---
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], options?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useMemo(() => (key: keyof typeof translations['en'], options?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en'][key];
    if (options) {
        Object.keys(options).forEach(optKey => {
            translation = translation.replace(`{${optKey}}`, String(options[optKey]));
        });
    }
    return translation;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// --- Cart Context ---
interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    addToCart: (item: Product, quantity: number, selectedVariant?: { [key: string]: string }) => void;
    removeFromCart: (itemId: number, variantId?: string) => void;
    updateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const addToCart = (product: Product, quantity: number, selectedVariant?: { [key: string]: string }) => {
        setCartItems(prevItems => {
            const variantId = JSON.stringify(selectedVariant);
            const existingItem = prevItems.find(item => item.id === product.id && JSON.stringify(item.selectedVariant) === variantId);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id && JSON.stringify(item.selectedVariant) === variantId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity, selectedVariant }];
        });
        setIsCartOpen(true);
    };
    
    const removeFromCart = (productId: number, variantId?: string) => {
        setCartItems(prevItems => prevItems.filter(item => 
            !(item.id === productId && JSON.stringify(item.selectedVariant) === variantId)
        ));
    };
    
    const updateQuantity = (productId: number, quantity: number, variantId?: string) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
        } else {
            setCartItems(prevItems => prevItems.map(item => 
                item.id === productId && JSON.stringify(item.selectedVariant) === variantId
                    ? { ...item, quantity }
                    : item
            ));
        }
    };
    

    const clearCart = () => setCartItems([]);
    
    const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
    const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

// --- User Context ---
interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlistItem: (productId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleWishlistItem = (productId: number) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      
      const newWishlist = prevUser.wishlist.includes(productId)
        ? prevUser.wishlist.filter(id => id !== productId)
        : [...prevUser.wishlist, productId];
      
      return { ...prevUser, wishlist: newWishlist };
    });
  };

  const isLoggedIn = useMemo(() => !!currentUser, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, isLoggedIn, login, logout, toggleWishlistItem }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the contexts themselves for the hooks to use
export { ThemeContext, I18nContext, CartContext, UserContext };