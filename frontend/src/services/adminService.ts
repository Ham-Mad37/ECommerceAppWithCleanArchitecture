import { api } from "./api";
import type { PagedResult } from "../types/common";
import type { Category, CategoryList } from "../types/category";
import type { Customer, CustomerListItem } from "../types/customer";
import type { DailySales, DashboardSummary, LowStockProduct, TopProduct } from "../types/dashboard";
import type { AdminOrder, AdminOrderFilters, AdminOrderListItem } from "../types/order";
import type { ProductPayload } from "../types/product";

// create endpoints may answer a bare number or { id } - accept both
const idOf = (d: unknown): number =>
  typeof d === "number" ? d : Number((d as { id?: number } | null)?.id ?? 0);

export const adminDashboard = {
  summary: async (from?: string, to?: string) =>
    (await api.get<DashboardSummary>("/admin/dashboard/summary", { params: { from, to } })).data,
  topProducts: async (from?: string, to?: string, take = 5) =>
    (await api.get<TopProduct[]>("/admin/dashboard/top-products", { params: { from, to, take } })).data,
  salesByDay: async (from?: string, to?: string) =>
    (await api.get<DailySales[]>("/admin/dashboard/sales-by-day", { params: { from, to } })).data,
  lowStock: async (threshold = 5, take = 50) =>
    (await api.get<LowStockProduct[]>("/admin/dashboard/low-stock", { params: { threshold, take } })).data,
};

export const adminProducts = {
  create: async (p: ProductPayload): Promise<number> =>
    idOf((await api.post("/products", p)).data),
  update: async (id: number, p: ProductPayload): Promise<void> => {
    await api.put(`/products/${id}`, {
      id,
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId: p.categoryId,
    });
  },
  activate: async (id: number) => { await api.patch(`/products/${id}/activate`); },
  deactivate: async (id: number) => { await api.patch(`/products/${id}/deactivate`); },
  adjustStock: async (id: number, quantity: number) => {
    await api.patch(`/products/${id}/stock`, { productId: id, quantity });
  },
  uploadImage: async (id: number, file: File): Promise<void> => {
    const form = new FormData();
    form.append("file", file);
    await api.post(`/products/${id}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  setPrimaryImage: async (id: number, imageId: number) => {
    await api.patch(`/products/${id}/images/${imageId}/primary`);
  },
  deleteImage: async (id: number, imageId: number) => {
    await api.delete(`/products/${id}/images/${imageId}`);
  },
};

export const adminCategories = {
  list: async (): Promise<CategoryList[]> => (await api.get<CategoryList[]>("/categories")).data,
  create: async (name: string): Promise<number> =>
    idOf((await api.post("/categories", { name })).data),
  update: async (id: number, name: string) => { await api.put(`/categories/${id}`, { id, name }); },
  activate: async (id: number) => { await api.patch(`/categories/${id}/activate`); },
  deactivate: async (id: number) => { await api.patch(`/categories/${id}/deactivate`); },
  get: async (id: number): Promise<Category> => (await api.get<Category>(`/categories/${id}`)).data,
};

export const adminCustomers = {
  list: async (): Promise<CustomerListItem[]> => (await api.get<CustomerListItem[]>("/customers")).data,
  get: async (id: number): Promise<Customer> => (await api.get<Customer>(`/customers/${id}`)).data,
  update: async (id: number, firstName: string, lastName: string) => {
    await api.put(`/customers/${id}`, { id, firstName, lastName });
  },
  activate: async (id: number) => { await api.post(`/customers/${id}/activate`); },
  deactivate: async (id: number) => { await api.post(`/customers/${id}/deactivate`); },
};

const clean = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined));

// The admin order routes exist in two shapes depending on the backend build:
//   A) /orders/admin, /orders/{id}/confirm/Admin ...   (your API documentation)
//   B) /admin/orders, /admin/orders/{id}/confirm ...   (AdminOrdersController in the repo)
// We try A first, fall back to B on 404/405 and remember whichever one works.
let style: "A" | "B" = "A";

const route = (kind: "list" | "get" | "confirm" | "processing" | "ship" | "deliver" | "payment", id = 0, s: "A" | "B" = style) => {
  if (s === "A") {
    return {
      list: "/orders/admin", get: `/orders/admin/${id}`,
      confirm: `/orders/${id}/confirm/Admin`, processing: `/orders/${id}/processing/Admin`,
      ship: `/orders/${id}/ship/Admin`, deliver: `/orders/${id}/deliver/Admin`,
      payment: `/orders/${id}/payment/confirm/Admin`,
    }[kind];
  }
  return {
    list: "/admin/orders", get: `/admin/orders/${id}`,
    confirm: `/admin/orders/${id}/confirm`, processing: `/admin/orders/${id}/processing`,
    ship: `/admin/orders/${id}/ship`, deliver: `/admin/orders/${id}/deliver`,
    payment: `/admin/orders/${id}/payment/confirm`,
  }[kind];
};

async function withFallback<T>(call: (s: "A" | "B") => Promise<T>): Promise<T> {
  const order: Array<"A" | "B"> = style === "A" ? ["A", "B"] : ["B", "A"];
  let lastError: unknown;
  for (const s of order) {
    try {
      const result = await call(s);
      style = s;
      return result;
    } catch (e) {
      lastError = e;
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status !== 404 && status !== 405) throw e; // a real answer (400/401/403/409...) - stop
    }
  }
  throw lastError;
}

const put = (kind: "confirm" | "processing" | "ship" | "deliver", id: number) =>
  withFallback(async (s) => { await api.put(route(kind, id, s)); });

export const adminOrders = {
  list: (f: AdminOrderFilters = {}): Promise<PagedResult<AdminOrderListItem>> =>
    withFallback(async (s) =>
      (await api.get<PagedResult<AdminOrderListItem>>(route("list", 0, s), {
        params: clean({ Page: f.page, PageSize: f.pageSize, Status: f.status, CustomerId: f.customerId, From: f.from, To: f.to }),
      })).data),

  get: (id: number): Promise<AdminOrder> =>
    withFallback(async (s) => {
      const d = (await api.get(route("get", id, s))).data;
      if (d && d.order) return d as AdminOrder;           // { order, customer }
      return {                                             // flat order
        order: d,
        customer: { id: d.customerId, name: d.customerName ?? `Customer #${d.customerId}`, email: d.customerEmail ?? "" },
      } as AdminOrder;
    }),

  confirm: (id: number) => put("confirm", id),
  startProcessing: (id: number) => put("processing", id),
  ship: (id: number) => put("ship", id),
  deliver: (id: number) => put("deliver", id),
  confirmPayment: (id: number, reference?: string) =>
    withFallback(async (s) => { await api.put(route("payment", id, s), { reference: reference || null }); }),
};
