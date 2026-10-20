import { api } from "./api";
import type { Category, CategoryList } from "../types/category";

export const categoryService = {
  getCategories: async (): Promise<CategoryList[]> =>
    (await api.get<CategoryList[]>("/categories")).data,
  getCategory: async (id: number): Promise<Category> =>
    (await api.get<Category>(`/categories/${id}`)).data,
};
