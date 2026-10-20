import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";
import type { OrderItem } from "../types/order";

interface CartContextType {
  /** total units in the cart (shown as the badge in the header) */
  count: number;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  /** puts every item of a past order back in the cart; reports the ones that could not be added */
  reorder: (items: OrderItem[]) => Promise<{ added: number; failed: string[] }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    // admins have no customer account, so they have no cart
    if (!isAuthenticated || isAdmin) {
      setCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      setCount(cart.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCount(0);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      await cartService.addItem({ productId, quantity });
      await refresh();
    },
    [refresh]
  );

  const reorder = useCallback(
    async (items: OrderItem[]) => {
      let added = 0;
      const failed: string[] = [];
      for (const item of items) {
        try {
          await cartService.addItem({ productId: item.productId, quantity: item.quantity });
          added++;
        } catch {
          failed.push(item.productName); // out of stock, inactive or removed
        }
      }
      await refresh();
      return { added, failed };
    },
    [refresh]
  );

  const value = useMemo(() => ({ count, refresh, addItem, reorder }), [count, refresh, addItem, reorder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
