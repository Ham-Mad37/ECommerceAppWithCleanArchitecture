import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({ api: { get: vi.fn(), put: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

import { api } from "./api";
import { adminOrders } from "./adminService";

const notFound = Object.assign(new Error("404"), { response: { status: 404 } });
const forbidden = Object.assign(new Error("403"), { response: { status: 403 } });

beforeEach(() => vi.clearAllMocks());

describe("adminOrders route fallback", () => {
  it("uses the documented route first", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: undefined });
    await adminOrders.confirm(5);
    expect(vi.mocked(api.put).mock.calls[0][0]).toBe("/orders/5/confirm/Admin");
  });

  it("falls back to /admin/orders when the first route is a 404", async () => {
    vi.mocked(api.put).mockRejectedValueOnce(notFound).mockResolvedValueOnce({ data: undefined });
    await adminOrders.ship(8);
    expect(vi.mocked(api.put).mock.calls.map((c) => c[0])).toEqual(["/orders/8/ship/Admin", "/admin/orders/8/ship"]);
  });

  it("does not retry on a real rejection such as 403", async () => {
    vi.mocked(api.put).mockRejectedValueOnce(forbidden);
    await expect(adminOrders.deliver(1)).rejects.toBe(forbidden);
    expect(api.put).toHaveBeenCalledTimes(1);
  });

  it("wraps a flat order into { order, customer }", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { id: 3, customerId: 9, customerName: "Sara", customerEmail: "s@x.com", items: [] } });
    const res = await adminOrders.get(3);
    expect(res.order.id).toBe(3);
    expect(res.customer).toEqual({ id: 9, name: "Sara", email: "s@x.com" });
  });
});
