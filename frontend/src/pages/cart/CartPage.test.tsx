import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { Cart } from "../../types/cart";

const cart: Cart = {
  id: 1, subtotal: 95,
  items: [
    { productId: 1, productName: "Low stock mug", unitPrice: 10, quantity: 2, lineTotal: 20, imageUrl: null, availableStock: 3 },
    { productId: 2, productName: "Too many chairs", unitPrice: 25, quantity: 3, lineTotal: 75, imageUrl: null, availableStock: 2 },
  ],
};

vi.mock("../../services/cartService", () => ({ cartService: { getCart: vi.fn(async () => cart), updateItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() } }));
vi.mock("../../context/CartContext", () => ({ useCart: () => ({ refresh: vi.fn(), addItem: vi.fn(), count: 5 }) }));
vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: { userId: "u1" } }) }));

import CartPage from "./CartPage";

describe("CartPage stock warnings", () => {
  it("warns about low and over-requested stock and blocks checkout", async () => {
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    expect(await screen.findByText(/Only 3 left in stock/)).toBeInTheDocument();
    expect(screen.getByText(/Only 2 available/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set to 2/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Proceed to checkout/ })).toBeDisabled();
  });
});
