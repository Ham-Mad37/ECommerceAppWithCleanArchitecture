import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const confirm = vi.fn(async () => undefined);
const ship = vi.fn(async () => undefined);

vi.mock("../../services/adminService", () => ({
  adminOrders: {
    list: vi.fn(async () => ({
      items: [
        { id: 7, customerId: 1, customerName: "Sara Ali", customerEmail: "s@x.com", status: "Pending", total: 55, createdAt: "2026-10-18T10:00:00Z", paymentStatus: "Pending" },
        { id: 6, customerId: 2, customerName: "Omar K", customerEmail: "o@x.com", status: "Delivered", total: 20, createdAt: "2026-10-17T10:00:00Z", paymentStatus: "Paid" },
      ],
      pageNumber: 1, pageSize: 15, totalCount: 2, totalPages: 1,
    })),
    confirm: (...a: unknown[]) => confirm(...(a as [])),
    ship: (...a: unknown[]) => ship(...(a as [])),
    startProcessing: vi.fn(), deliver: vi.fn(),
  },
}));

import AdminOrders from "./AdminOrders";

describe("AdminOrders", () => {
  it("approves a pending order from the list", async () => {
    render(<MemoryRouter><AdminOrders /></MemoryRouter>);
    await userEvent.click(await screen.findByRole("button", { name: "Approve" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/1 order updated/)).toBeInTheDocument();
  });

  it("offers no action for delivered orders", async () => {
    render(<MemoryRouter><AdminOrders /></MemoryRouter>);
    await screen.findByText("Omar K");
    expect(screen.queryByLabelText("Select order 6")).toBeNull();
    expect(ship).not.toHaveBeenCalled();
  });
});
