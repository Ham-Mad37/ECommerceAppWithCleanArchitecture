export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  categoryName?: string | null;
  imageUrl?: string | null;
  images?: string[];
}

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  descending?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}