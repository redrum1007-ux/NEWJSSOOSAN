import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (newItem) => set((state) => {
    const existing = state.items.find(item => item.id === newItem.id);
    if (existing) {
      return {
        items: state.items.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter(item => item.id !== id)
      : state.items.map(item => item.id === id ? { ...item, quantity } : item),
  })),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
  getTotalCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
  clearCart: () => set({ items: [] }),
}));
