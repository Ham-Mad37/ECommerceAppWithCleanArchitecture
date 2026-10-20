import type { Cart, CartItem } from "../types/cart";

export const LOW_STOCK = 5;

export type StockState = "out" | "over" | "low" | "ok";

export function stockState(item: CartItem): StockState {
  if (item.availableStock <= 0) return "out";
  if (item.quantity > item.availableStock) return "over";
  if (item.availableStock <= LOW_STOCK) return "low";
  return "ok";
}

/** items that make the order impossible to place right now */
export const blockingItems = (cart: Cart) => cart.items.filter((i) => ["out", "over"].includes(stockState(i)));
