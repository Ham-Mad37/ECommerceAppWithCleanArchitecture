import { api } from "./api";

import type {
  CategoryList,
  Category,
} from "../types/category";

export const categoryService = {
  async getCategories(): Promise<CategoryList[]> {
    const response =
      await api.get<CategoryList[]>(
        "/categories"
      );

    return response.data;
  },

  async getCategory(
    id: number
  ): Promise<Category> {
    const response =
      await api.get<Category>(
        `/categories/${id}`
      );

    return response.data;
  },
};