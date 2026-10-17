import { api } from "./api";

import type {
  Product,
  ProductListParams,
  ProductListResponse,
} from "../types/product";

const getProducts = async (
  params: ProductListParams = {}
): Promise<ProductListResponse> => {
  const response =
    await api.get<ProductListResponse>(
      "/products",
      {
        params: {
          pageNumber:
            params.pageNumber ?? 1,

          pageSize:
            params.pageSize ?? 12,

          search:
            params.search || undefined,

          minPrice:
            params.minPrice,

          maxPrice:
            params.maxPrice,

          sortBy:
            params.sortBy,

          descending:
            params.descending,
        },
      }
    );

  return response.data;
};

const getProductById = async (
  id: number
): Promise<Product> => {
  const response =
    await api.get<Product>(
      `/products/${id}`
    );

  return response.data;
};

export const productService = {
  getProducts,
  getProductById,
};