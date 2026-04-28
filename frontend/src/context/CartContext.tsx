import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: any;
}

interface Cart {
  id: number;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const refreshCart = async () => {
    try {
      const data = await api.cart.get();
      setCart(data);
      // BUG: total not updated when cart changes
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  // Cart only exists in local state - lost on reload

  const addItem = async (productId: number, quantity = 1) => {
    setLoading(true);
    try {
      const data = await api.cart.addItem(productId, quantity);
      setCart(data);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      await api.cart.updateItem(itemId, quantity);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      await api.cart.removeItem(itemId);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.cart.clear();
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, total, addItem, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};