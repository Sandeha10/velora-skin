import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import axios from 'axios'; 

const FREE_SHIPPING_THRESHOLD = 75;

export const CartDrawer = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShippingRemaining,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shippingRemaining = getShippingRemaining();
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer]);

  // Stripe Checkout Handler (Direct Axios Call)
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const { data } = await axios.post(
        `${apiUrl}/orders/checkout-session`,
        {
          cartItems: items,
          shippingAddress: {
            street: '45 Lotus Grove',
            city: 'Colombo',
            postalCode: '00700',
            country: 'LK',
          },
        },
        { withCredentials: true }
      );

      // Redirect to Stripe Hosted Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Please log in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Slide-over Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="w-screen max-w-md bg-velora-surface shadow-2xl flex flex-col border-l border-velora-border"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Cart Drawer"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-velora-border flex items-center justify-between bg-velora-canvas/60">
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-lg tracking-luxury text-velora-primary uppercase">
                    Your Selection
                  </h2>
                  <span className="text-xs text-velora-muted font-mono">
                    ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="text-velora-muted hover:text-velora-primary p-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Free Shipping Dynamic Progress Bar */}
              <div className="px-6 py-4 bg-stone-50 border-b border-velora-border">
                <div className="flex items-center justify-between text-xs mb-2">
                  {shippingRemaining > 0 ? (
                    <span className="text-stone-700 font-light">
                      Add <strong className="font-medium text-velora-emerald">${shippingRemaining.toFixed(2)}</strong> more for complimentary delivery
                    </span>
                  ) : (
                    <span className="text-velora-emerald font-medium flex items-center gap-1.5">
                      <Sparkles size={13} /> Complimentary Botanical Delivery Unlocked
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-velora-muted">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-velora-emerald"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-velora-border">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-velora-muted mb-4">
                      <X size={22} className="opacity-40" />
                    </div>
                    <p className="font-serif text-lg text-velora-primary mb-1">Your cart is empty</p>
                    <p className="text-xs text-velora-muted max-w-xs mb-6">
                      Explore our clinical botanical formulations crafted to re-establish dermal harmony.
                    </p>
                    <button
                      onClick={closeDrawer}
                      className="text-xs uppercase tracking-luxury border border-velora-primary text-velora-primary px-6 py-3 hover:bg-velora-primary hover:text-white transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const activePrice = item.discountPrice || item.price;
                    const itemImage =
                      item.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1608248597359-00995c73d9d3?auto=format&fit=crop&q=80&w=300';

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item._id}
                        className="py-4 flex gap-4 items-center"
                      >
                        {/* Thumbnail */}
                        <div className="w-18 h-22 bg-stone-100 flex-shrink-0 border border-velora-border overflow-hidden">
                          <img
                            src={itemImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm text-velora-primary truncate mb-0.5">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-velora-muted uppercase tracking-wider mb-2">
                            {item.volume || 'Pure Formulation'}
                          </p>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="inline-flex items-center border border-velora-border bg-stone-50">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="p-1 text-stone-600 hover:text-velora-primary transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2.5 text-xs font-mono font-medium text-velora-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="p-1 text-stone-600 hover:text-velora-primary transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Item Price */}
                            <div className="text-right">
                              <span className="text-xs font-mono font-medium text-velora-primary">
                                ${(activePrice * item.quantity).toFixed(2)}
                              </span>
                              {item.discountPrice && (
                                <span className="block text-[10px] text-stone-400 line-through font-mono">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-stone-400 hover:text-rose-600 p-1 self-start transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-6 border-t border-velora-border bg-stone-50/70 space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-velora-muted">
                      <span>Subtotal</span>
                      <span className="font-mono text-velora-primary">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-velora-muted">
                      <span>Shipping</span>
                      <span className="font-mono">
                        {shippingRemaining === 0 ? (
                          <span className="text-velora-emerald font-medium">Free</span>
                        ) : (
                          '$8.00'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-velora-border font-medium text-velora-primary">
                      <span>Estimated Total</span>
                      <span className="font-mono">
                        ${(subtotal + (shippingRemaining === 0 ? 0 : 8)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-velora-primary text-white py-4 px-6 text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-velora-emerald transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Redirecting to Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Ritual Checkout</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-velora-muted tracking-wider uppercase">
                    <ShieldCheck size={13} className="text-velora-emerald" />
                    <span>256-bit Encrypted SSL Transaction</span>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};