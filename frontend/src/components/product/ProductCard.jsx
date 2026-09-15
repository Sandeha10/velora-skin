import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Star } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const ProductCard = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const activePrice = product.discountPrice || product.price;
  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1608248597359-00995c73d9d3?auto=format&fit=crop&q=80&w=600';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group flex flex-col h-full bg-velora-surface border border-velora-border p-4 transition-shadow hover:shadow-lg"
    >
      {/* Image Canvas with Scale Effect */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 mb-4">
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discountPrice && (
            <span className="bg-velora-emerald text-white text-[9px] uppercase tracking-luxury px-2 py-1 font-medium">
              Formulation Offer
            </span>
          )}
          {product.isFeatured && !product.discountPrice && (
            <span className="bg-velora-primary text-white text-[9px] uppercase tracking-luxury px-2 py-1 font-medium">
              Signature
            </span>
          )}
        </div>

        {/* Quick Add Overlay Button */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 p-3 bg-velora-surface/90 backdrop-blur-md text-velora-primary border border-velora-border shadow-sm hover:bg-velora-emerald hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Add ${product.title} to cart`}
        >
          {isAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Meta & Category */}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-luxury text-velora-muted mb-1">
        <span>{product.category}</span>
        <span>{product.volume}</span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-base text-velora-primary font-normal leading-snug mb-1.5 group-hover:text-velora-emerald transition-colors">
        {product.title}
      </h3>

      {/* Subtitle / Botanical Notes */}
      <p className="text-xs text-stone-500 line-clamp-1 font-light mb-3">
        {product.subtitle}
      </p>

      {/* Footer: Price & Rating */}
      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-medium text-velora-primary">
            ${activePrice.toFixed(2)}
          </span>
          {product.discountPrice && (
            <span className="font-mono text-xs text-stone-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center text-[11px] text-stone-500 gap-1 font-mono">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span>{product.ratingsAverage.toFixed(1)}</span>
        </div>
      </div>
    </motion.article>
  );
};