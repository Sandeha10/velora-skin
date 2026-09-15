import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FREE_SHIPPING_THRESHOLD = 75; // $75 USD

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      // Drawer Actions
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // Item Management
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item._id === product._id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ items: updated, isDrawerOpen: true });
        } else {
          set({
            items: [...currentItems, { ...product, quantity }],
            isDrawerOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item._id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      // Computed Metrics
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getShippingRemaining: () => {
        const subtotal = get().getSubtotal();
        const diff = FREE_SHIPPING_THRESHOLD - subtotal;
        return diff > 0 ? diff : 0;
      },
    }),
    {
      name: 'velora_cart_vault',
      partialize: (state) => ({ items: state.items }), // Only persist cart items
    }
  )
);