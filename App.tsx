import React, { useState, useEffect } from 'react';
import { Header } from './components/organisms/Header';
import { Footer } from './components/organisms/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import RegistrationPage from './pages/RegistrationPage';
import AboutPage from './pages/AboutPage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import MyAccountPage from './pages/MyAccountPage';
import DashboardPage from './pages/DashboardPage';
import BrandKitPage from './pages/BrandKitPage';
import ErrorPage from './pages/ErrorPage';
import { useCart } from './hooks';
import { AnnouncementBar } from './components/organisms/AnnouncementBar';
import { CookieConsentBanner } from './components/organisms/CookieConsentBanner';
import { CookieSettingsModal } from './components/organisms/CookieSettingsModal';
import { Chatbot } from './components/organisms/Chatbot';

export type Page = 'home' | 'shop' | 'product' | 'checkout' | 'registration' | 'about' | 'search' | 'categories' | 'my-account' | 'dashboard' | 'brand-kit' | 'error';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const { isCartOpen } = useCart();

  useEffect(() => {
    // Hide page scroll when cart or mobile menu is open
    document.body.style.overflow = isCartOpen ? 'hidden' : 'auto';
  }, [isCartOpen]);

  const navigateTo = (page: Page, productId?: number) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    } else {
      setSearchQuery(''); // Clear search when navigating elsewhere
    }
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'shop':
        return <ShopPage navigateTo={navigateTo} />;
      case 'categories':
        return <CategoriesPage navigateTo={navigateTo} />;
      case 'product':
        return <ProductDetailPage productId={selectedProductId} navigateTo={navigateTo} />;
      case 'checkout':
        return <CheckoutPage navigateTo={navigateTo} />;
      case 'registration':
        return <RegistrationPage navigateTo={navigateTo} />;
      case 'about':
        return <AboutPage navigateTo={navigateTo} />;
      case 'search':
        return <SearchPage searchQuery={searchQuery} navigateTo={navigateTo} />;
      case 'my-account':
        return <MyAccountPage navigateTo={navigateTo} />;
      case 'dashboard':
        return <DashboardPage navigateTo={navigateTo} />;
      case 'brand-kit':
        return <BrandKitPage navigateTo={navigateTo} />;
      case 'error':
      default:
        return <ErrorPage navigateTo={navigateTo} />;
    }
  };

  const showLayout = currentPage !== 'my-account' && currentPage !== 'dashboard' && currentPage !== 'error';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       {showLayout && <AnnouncementBar />}
       {showLayout && <Header navigateTo={navigateTo} handleSearch={handleSearch} />}
      <main className="flex-grow">
        {renderPage()}
      </main>
      {showLayout && <Footer navigateTo={navigateTo} onSettingsClick={() => setIsCookieSettingsOpen(true)} />}
      {showLayout && (
        <>
          <CookieConsentBanner onSettingsClick={() => setIsCookieSettingsOpen(true)} />
          <CookieSettingsModal isOpen={isCookieSettingsOpen} onOpenChange={setIsCookieSettingsOpen} />
        </>
       )}
      {showLayout && <Chatbot />}
    </div>
  );
};

export default App;