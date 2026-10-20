export interface ProductList {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  primaryImageUrl: string | null;
}

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean; // only honoured for admins
  sortBy?: "id" | "name" | "price" | "stockQuantity";
  sortDirection?: "asc" | "desc";
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
}
