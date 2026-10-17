export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
  availableStock: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
}