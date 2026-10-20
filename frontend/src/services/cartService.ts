import { api } from "./api";
import type { AddCartItemRequest, Cart } from "../types/cart";

export const cartService = {
  getCart: async (): Promise<Cart> => (await api.get<Cart>("/cart")).data,
  addItem: async (request: AddCartItemRequest): Promise<void> => {
    await api.post("/cart/items", request);
  },
  updateItem: async (productId: number, quantity: number): Promise<void> => {
    await api.put(`/cart/items/${productId}`, { quantity });
  },
  removeItem: async (productId: number): Promise<void> => {
    await api.delete(`/cart/items/${productId}`);
  },
  clear: async (): Promise<void> => {
    await api.delete("/cart");
  },
};
