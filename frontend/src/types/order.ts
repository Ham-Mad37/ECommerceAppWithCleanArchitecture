export interface CreateOrderResponse {
  orderId: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;

  total: number;

  status: string;

  createdAt: string;

  customerId?: number;

  customerName?: string | null;

  customerEmail?: string | null;

  items: OrderItem[];
}