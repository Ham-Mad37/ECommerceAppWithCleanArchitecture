export interface DashboardSummary {
  from: string;
  to: string;
  totalOrders: number;
  cancelledOrders: number;
  grossSales: number;
  collectedRevenue: number;
  outstandingPayments: number;
  refundsDue: number;
  averageOrderValue: number;
  newCustomers: number;
  ordersByStatus: Record<string, number>;
}
export interface TopProduct { productId: number; productName: string; unitsSold: number; revenue: number }
export interface DailySales { date: string; orders: number; sales: number }
export interface LowStockProduct { productId: number; name: string; categoryName: string; stockQuantity: number }
