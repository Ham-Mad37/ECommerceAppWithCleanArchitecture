import { api } from "./api";
import type { PagedResult } from "../types/common";
import type { Product, ProductList, ProductListParams } from "../types/product";

const getProducts = async (params: ProductListParams = {}): Promise<PagedResult<ProductList>> => {
  const { data } = await api.get<PagedResult<ProductList>>("/products", {
    params: {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 12,
      search: params.search || undefined,
      categoryId: params.categoryId,
      isActive: params.isActive,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    },
  });
  return data;
};

const getProductById = async (id: number): Promise<Product> =>
  (await api.get<Product>(`/products/${id}`)).data;

export const productService = { getProducts, getProductById };
