import { api } from "./api";

import type {
  Customer,
} from "../types/customer";

const getCurrentCustomer =
  async (): Promise<Customer> => {
    const response =
      await api.get<Customer>(
        "/customers/me"
      );

    return response.data;
  };

const updateShippingAddress =
  async (
    shippingAddress: string
  ): Promise<void> => {
    await api.put(
      "/customers/me/shipping-address",
      {
        shippingAddress,
      }
    );
  };

export const customerService = {
  getCurrentCustomer,
  updateShippingAddress,
};