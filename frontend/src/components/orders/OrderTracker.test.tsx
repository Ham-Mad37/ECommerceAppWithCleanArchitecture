import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrderTracker from "./OrderTracker";

describe("OrderTracker", () => {
  it("marks the current step", () => {
    render(<OrderTracker status="Processing" />);
    expect(screen.getByText("Processing").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Shipped").closest("li")).not.toHaveAttribute("aria-current");
  });

  it("shows all steps for a delivered order with none 'current'", () => {
    render(<OrderTracker status="Delivered" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(document.querySelector('[aria-current="step"]')).toBeNull();
  });

  it("shows a banner instead of steps when cancelled", () => {
    render(<OrderTracker status="Cancelled" />);
    expect(screen.getByText(/was cancelled/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
