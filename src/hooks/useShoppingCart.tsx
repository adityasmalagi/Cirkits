import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    } else {
      // Load from localStorage for guest users
      const savedCart = localStorage.getItem('guest_cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to load guest cart');
        }
      }
    }
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user && items.length > 0) {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  }, [items, user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const cartItems: CartItem[] = data.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          projectTitle: item.project_title,
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToDatabase = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;

    try {
      // Delete all existing items for user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert new items
      if (newItems.length > 0) {
        const insertData = newItems.map(item => ({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
          project_title: item.projectTitle || null,
        }));

        await supabase.from('cart_items').insert(insertData);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  }, [user]);

  const addItem = useCallback((product: Product, quantity = 1, projectTitle?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      
      if (existing) {
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { product, quantity, projectTitle }];
      }
      
      syncToDatabase(newItems);
      return newItems;
    });
  }, [syncToDatabase]);

  const addProjectItems = useCallback((projectItems: { product: Product; quantity: number }[], projectTitle: string) => {
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
      
      syncToDatabase(newItems);
      return newItems;
    });
    setIsOpen(true);
    
    if (user) {
      toast({
        title: 'Components added to cart',
        description: 'Your cart has been saved to your account.',
      });
    }
  }, [syncToDatabase, user, toast]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      syncToDatabase(newItems);
      return newItems;
    });
  }, [syncToDatabase]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      syncToDatabase(newItems);
      return newItems;
    });
  }, [removeItem, syncToDatabase]);

  const clearCart = useCallback(() => {
    setItems([]);
    syncToDatabase([]);
    if (!user) {
      localStorage.removeItem('guest_cart');
    }
  }, [syncToDatabase, user]);

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
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isOpen,
        setIsOpen,
        isLoading,
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
