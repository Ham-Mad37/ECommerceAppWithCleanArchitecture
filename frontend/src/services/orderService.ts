import { api } from "./api";

export interface CreateOrderRequest {
  addressId: number;
}

const createOrder = async (
  addressId: number
): Promise<number> => {
  const response = await api.post<number>(
    "/orders",
    {
      addressId,
    }
  );

  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get(
    "/orders"
  );

  return response.data;
};

const getOrderById = async (
  id: number
) => {
  const response = await api.get(
    `/orders/${id}`
  );

  return response.data;
};

export const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
};