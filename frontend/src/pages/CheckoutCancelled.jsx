import { ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export const CheckoutCancelled = () => {
  const openDrawer = useCartStore((state) => state.openDrawer);

  return (
    <div className="max-w-xl mx-auto my-20 px-6 py-12 bg-velora-surface border border-velora-border text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={22} className="text-velora-muted" />
      </div>

      <span className="text-[10px] uppercase tracking-editorial text-velora-muted font-medium block mb-2">
        Checkout Suspended
      </span>
      <h1 className="font-serif text-3xl text-velora-primary font-normal mb-3">
        Your ritual was not processed.
      </h1>
      <p className="text-xs text-velora-muted font-light leading-relaxed max-w-sm mx-auto mb-8">
        No funds were debited from your card. Your curated formulation selections remain securely retained in your cart.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={openDrawer}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-velora-primary text-white text-xs uppercase tracking-editorial py-3.5 px-6 hover:bg-velora-emerald transition-colors"
        >
          <ShoppingBag size={14} />
          <span>Reopen Selection Cart</span>
        </button>
        <a
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-velora-border text-stone-700 text-xs uppercase tracking-editorial py-3.5 px-6 hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </a>
      </div>
    </div>
  );
};