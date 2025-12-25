import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/database';

interface CartItem {
  product: Product;
  quantity: number;
  projectTitle?: string;
}

interface ShoppingCartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, projectTitle?: string) => void;
  addProjectItems: (items: { product: Product; quantity: number }[], projectTitle: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product: Product, quantity = 1, projectTitle?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, projectTitle }];
    });
  };

  const addProjectItems = (projectItems: { product: Product; quantity: number }[], projectTitle: string) => {
    setItems(prev => {
      const newItems = [...prev];
      projectItems.forEach(({ product, quantity }) => {
        const existingIndex = newItems.findIndex(item => item.product.id === product.id);
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += quantity;
        } else {
          newItems.push({ product, quantity, projectTitle });
        }
      });
      return newItems;
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        items,
        addItem,
        addProjectItems,
        removeItem,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
}
