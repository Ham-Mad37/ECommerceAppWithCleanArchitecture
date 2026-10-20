export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryList = Pick<Category, "id" | "name" | "isActive">;
