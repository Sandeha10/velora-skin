import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star, Droplet, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

export const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const activePrice = product.discountPrice || product.price;
  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1608248597359-00995c73d9d3?auto=format&fit=crop&q=80&w=800';

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-velora-surface border border-velora-border shadow-2xl z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-velora-muted hover:text-velora-primary p-2 bg-velora-surface/80 backdrop-blur-sm rounded-full transition-colors"
            aria-label="Close details"
          >
            <X size={18} />
          </button>

          {/* Left: Product Visual */}
          <div className="w-full md:w-1/2 bg-stone-100 relative min-h-[300px] md:min-h-[500px]">
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="bg-velora-surface/90 backdrop-blur-md text-velora-primary text-[10px] uppercase tracking-luxury px-3 py-1.5 font-medium border border-velora-border">
                {product.volume}
              </span>
            </div>
          </div>

          {/* Right: Formulation Details & Ritual */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-[11px] uppercase tracking-editorial text-velora-muted mb-2">
                <span className="text-velora-emerald font-medium">{product.category}</span>
                <div className="flex items-center gap-1 font-mono">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{product.ratingsAverage?.toFixed(1)} ({product.ratingsQuantity || 0})</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-serif text-2xl lg:text-3xl text-velora-primary font-normal mb-2 leading-tight">
                {product.title}
              </h2>
              <p className="text-xs text-velora-muted font-light leading-relaxed mb-6">
                {product.subtitle}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-velora-border mb-6">
                <span className="font-mono text-xl font-medium text-velora-primary">
                  ${activePrice.toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span className="font-mono text-sm text-stone-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-[11px] text-velora-muted uppercase tracking-wider ml-auto">
                  {product.stockCount > 0 ? 'Fresh Batch Available' : 'Allocation Reserved'}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-[11px] uppercase tracking-luxury text-velora-primary font-medium mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-velora-emerald" />
                  <span>Formulation Overview</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* The Ritual */}
              <div className="mb-6 p-4 bg-stone-50 border border-velora-border">
                <h4 className="text-[11px] uppercase tracking-luxury text-velora-primary font-medium mb-1.5 flex items-center gap-1.5">
                  <Droplet size={13} className="text-velora-emerald" />
                  <span>The Application Ritual</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-light italic">
                  "{product.ritualGuide}"
                </p>
              </div>

              {/* Key Ingredients */}
              {product.ingredients?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[11px] uppercase tracking-luxury text-velora-primary font-medium mb-2.5">
                    Active Botanicals
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-xs border border-stone-200/60 font-light"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-velora-border space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockCount <= 0}
                className="w-full bg-velora-primary text-white py-4 px-6 text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-velora-emerald transition-colors disabled:opacity-50"
              >
                {isAdded ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Acquire Formulation — ${activePrice.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-velora-muted uppercase tracking-wider">
                <ShieldCheck size={12} className="text-velora-emerald" />
                <span>Small-Batch Laboratory Certified</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};