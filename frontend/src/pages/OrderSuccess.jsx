import { useEffect, useState } from 'react';
import { Check, Package, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { apiClient } from '../services/api';
import { useCartStore } from '../store/useCartStore';

export const OrderSuccess = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearCart = useCartStore((state) => state.clearCart);

  // Extract orderId from URL: /order-success?orderId=...
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  useEffect(() => {
    // Clear persisted cart once user reaches verified success view
    clearCart();

    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order reference found in request.');
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get(`/orders/${orderId}`);
        setOrder(res.data.data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-velora-emerald border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-velora-muted">
            Validating Botanical Acquisition...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-stone-50 border border-velora-border text-center">
        <h2 className="font-serif text-2xl text-velora-primary mb-2">Order Notice</h2>
        <p className="text-xs text-velora-muted mb-6">{error || 'Order could not be located.'}</p>
        <a
          href="/"
          className="inline-block bg-velora-primary text-white text-xs uppercase tracking-editorial py-3 px-6 hover:bg-velora-emerald transition-colors"
        >
          Return to Catalog
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* Editorial Confirmation Header */}
      <div className="text-center pb-10 border-b border-velora-border">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-velora-emerald border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <Check size={24} />
        </div>
        <span className="text-[10px] uppercase tracking-editorial text-velora-emerald font-medium block mb-2">
          Ritual Acknowledged
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-velora-primary font-normal">
          Thank you for your acquisition.
        </h1>
        <p className="text-xs text-velora-muted font-mono mt-2">
          Order Reference: #{order._id}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-600">
          <Mail size={14} className="text-velora-emerald" />
          <span>A confirmation receipt has been dispatched to your email address.</span>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="py-8 border-b border-velora-border grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div>
          <h3 className="uppercase tracking-luxury text-velora-muted font-medium mb-3">
            Destination Address
          </h3>
          <p className="text-velora-primary leading-relaxed font-light">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        <div>
          <h3 className="uppercase tracking-luxury text-velora-muted font-medium mb-3">
            Batch Status
          </h3>
          <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 border border-stone-200 text-velora-primary capitalize">
            <Package size={14} className="text-velora-emerald" />
            <span>{order.orderStatus} & Hand-Preparation</span>
          </div>
        </div>
      </div>

      {/* Itemized Manifest */}
      <div className="py-8 border-b border-velora-border">
        <h3 className="text-xs uppercase tracking-luxury text-velora-muted font-medium mb-6">
          Formulation Manifest
        </h3>

        <div className="divide-y divide-stone-100">
          {order.orderItems.map((item) => (
            <div key={item.product} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-16 object-cover border border-velora-border bg-stone-100"
                />
                <div>
                  <h4 className="font-serif text-sm text-velora-primary">{item.title}</h4>
                  <p className="text-[11px] text-velora-muted font-mono">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-medium text-velora-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="py-6 space-y-2 text-xs">
        <div className="flex justify-between text-velora-muted">
          <span>Subtotal</span>
          <span className="font-mono">${order.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-velora-muted">
          <span>Carbon-Neutral Shipping</span>
          <span className="font-mono">
            {order.shippingPrice === 0 ? 'Complimentary' : `$${order.shippingPrice.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-base pt-3 border-t border-velora-border font-medium text-velora-primary">
          <span>Total Remitted</span>
          <span className="font-mono text-velora-emerald">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-velora-border">
        <div className="flex items-center gap-2 text-[11px] text-velora-muted uppercase tracking-wider">
          <ShieldCheck size={14} className="text-velora-emerald" />
          <span>Encrypted Order History Vault</span>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-velora-primary text-white text-xs uppercase tracking-editorial py-3.5 px-6 hover:bg-velora-emerald transition-colors"
        >
          <span>Continue Exploring</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};