import { useEffect, useState } from 'react';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductCatalog } from './components/product/ProductCatalog';
import { AuthModal } from './components/auth/AuthModal';
import { OrderSuccess } from './pages/OrderSuccess';
import { CheckoutCancelled } from './pages/CheckoutCancelled';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { addItem } = useCartStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check persistent session cookie and handle browser navigation
  useEffect(() => {
    checkAuth();

    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [checkAuth]);

  // Quick add helper for testing cart drawer and checkout flow
  const handleQuickAdd = () => {
    addItem({
      _id: 'sample_prod_01',
      title: 'Cellular Renewal Nectar',
      volume: '30ml / 1.0 fl. oz.',
      price: 88,
      discountPrice: 82,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1608248597359-00995c73d9d3?auto=format&fit=crop&q=80&w=300',
          alt: 'Cellular Renewal Nectar',
        },
      ],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-velora-canvas">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <AuthModal />

      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-6 w-full">
        {currentPath === '/order-success' ? (
          <OrderSuccess />
        ) : currentPath === '/checkout-cancelled' ? (
          <CheckoutCancelled />
        ) : (
          <>
            {/* Editorial Hero Banner */}
            <section className="text-center py-16 lg:py-24 border-b border-velora-border mb-12">
              <span className="text-xs uppercase tracking-editorial text-velora-emerald font-medium block mb-4">
                Formulation Series 2026 — Botanical Lipids
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-velora-primary font-normal max-w-3xl mx-auto leading-tight mb-6">
                Clinical purity meets ancestral botanicals.
              </h2>
              <p className="text-velora-muted text-sm lg:text-base max-w-xl mx-auto font-light leading-relaxed mb-8">
                Engineered in small batches using bio-fermented lipids, cold-pressed plant extracts, and clinical actives to rebalance skin ecology without synthetic interference.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#catalog"
                  className="inline-block bg-velora-primary text-white text-xs uppercase tracking-luxury py-4 px-8 hover:bg-velora-emerald transition-colors"
                >
                  Explore Formulations
                </a>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="inline-block border border-velora-primary text-velora-primary text-xs uppercase tracking-luxury py-4 px-8 hover:bg-velora-primary hover:text-white transition-colors cursor-pointer"
                >
                  Quick Add Sample to Cart
                </button>
              </div>
            </section>

            {/* Dynamic Faceted Catalog */}
            <section id="catalog">
              <ProductCatalog />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-velora-border py-12 bg-stone-100/50 mt-20 text-center text-xs text-velora-muted">
        <p className="font-serif text-base text-velora-primary uppercase tracking-editorial mb-2">
          Velora Skin Laboratory
        </p>
        <p>© 2026 Velora Skin Collective. Formulated with conscious reverence.</p>
      </footer>
    </div>
  );
}