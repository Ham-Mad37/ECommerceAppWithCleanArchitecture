import { api } from "./api";

import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "../types/address";

const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get<Address[]>("/addresses");

  return response.data;
};

const getAddressById = async (
  id: number
): Promise<Address> => {
  const response = await api.get<Address>(
    `/addresses/${id}`
  );

  return response.data;
};

const createAddress = async (
  request: CreateAddressRequest
): Promise<Address> => {
  const response = await api.post<Address>(
    "/addresses",
    request
  );

  return response.data;
};

const updateAddress = async (
  request: UpdateAddressRequest
): Promise<void> => {
  await api.put(
    `/addresses/${request.id}`,
    request
  );
};

const deleteAddress = async (
  id: number
): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};

export const addressService = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};