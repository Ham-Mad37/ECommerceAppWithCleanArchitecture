import { describe, expect, it } from "vitest";
import { blockingItems, stockState } from "./cartIssues";
import type { Cart, CartItem } from "../types/cart";

const item = (quantity: number, availableStock: number, productId = 1): CartItem => ({
  productId, productName: `P${productId}`, unitPrice: 10, quantity, lineTotal: 10 * quantity, imageUrl: null, availableStock,
});

describe("stockState", () => {
  it("flags sold-out items", () => expect(stockState(item(1, 0))).toBe("out"));
  it("flags quantities above stock", () => expect(stockState(item(4, 3))).toBe("over"));
  it("warns when stock is low but enough", () => expect(stockState(item(2, 5))).toBe("low"));
  it("is ok with plenty of stock", () => expect(stockState(item(2, 50))).toBe("ok"));
});

describe("blockingItems", () => {
  it("returns only items that make the order impossible", () => {
    const cart: Cart = { id: 1, subtotal: 0, items: [item(1, 0, 1), item(5, 2, 2), item(1, 3, 3), item(1, 20, 4)] };
    expect(blockingItems(cart).map((i) => i.productId)).toEqual([1, 2]);
  });
});
