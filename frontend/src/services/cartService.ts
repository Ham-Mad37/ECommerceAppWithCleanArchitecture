import { api } from "./api";

import type {
  AddCartItemRequest,
  Cart,
} from "../types/cart";

const addItem = async (
  request: AddCartItemRequest
): Promise<void> => {
  await api.post(
    "/cart/items",
    request
  );
};

const getCart = async (): Promise<Cart> => {
  const response =
    await api.get<Cart>("/cart");

  return response.data;
};

const updateItem = async (
  productId: number,
  quantity: number
): Promise<void> => {
  await api.put(
    `/cart/items/${productId}`,
    {
      quantity,
    }
  );
};

const removeItem = async (
  productId: number
): Promise<void> => {
  await api.delete(
    `/cart/items/${productId}`
  );
};

export const cartService = {
  addItem,
  getCart,
  updateItem,
  removeItem,
};