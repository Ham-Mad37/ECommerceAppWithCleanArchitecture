export type OrderStatus =
  | "Pending" | "Confirmed" | "Processing"
  | "Shipped" | "Delivered" | "Cancelled";

export type PaymentMethod = "CashOnDelivery" | "BankTransfer";
export type PaymentStatus = "Pending" | "Paid" | "Cancelled" | "RefundDue";

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  reference?: string | null;
  paidAt?: string | null;
}

export interface Order {
  id: number;
  customerId: number;
  status: OrderStatus;
  subTotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress | null;
  payment?: Payment | null;
}

export interface AdminOrderListItem {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paymentMethod?: PaymentMethod | null; // add to OrderListDto (see backend fixes)
  paymentStatus?: PaymentStatus | null;
}

export interface AdminOrder {
  order: Order;
  customer: { id: number; name: string; email: string };
}

export interface AdminOrderFilters {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | "";
  customerId?: number;
  from?: string;
  to?: string;
}
