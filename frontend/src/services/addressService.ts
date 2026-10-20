import { api } from "./api";
import type { Address, AddressPayload, CreateAddressRequest } from "../types/address";

export const addressService = {
  getAddresses: async (): Promise<Address[]> => (await api.get<Address[]>("/addresses")).data,
  createAddress: async (request: CreateAddressRequest): Promise<number> =>
    (await api.post<{ id: number }>("/addresses", request)).data.id,
  updateAddress: async (id: number, request: AddressPayload): Promise<void> => {
    await api.put(`/addresses/${id}`, { id, ...request });
  },
  setDefault: async (id: number): Promise<void> => {
    await api.patch(`/addresses/${id}/default`);
  },
  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },
};
