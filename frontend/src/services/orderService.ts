import { api } from "./api";
import type { Order, PaymentMethod } from "../types/order";

export const orderService = {
  // API answers { orderId } - the old code treated the body as a number.
  createOrder: async (addressId: number, paymentMethod: PaymentMethod): Promise<number> => {
    const { data } = await api.post<{ orderId: number }>("/orders", { addressId, paymentMethod });
    return data.orderId;
  },
  getMyOrders: async (): Promise<Order[]> => (await api.get<Order[]>("/orders")).data,
  getOrderById: async (id: number): Promise<Order> => (await api.get<Order>(`/orders/${id}`)).data,
  cancel: async (id: number): Promise<void> => {
    await api.put(`/orders/${id}/cancel`);
  },
};
