import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("shows a friendly screen instead of crashing", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("recovers when resetKey changes (user navigates away)", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<ErrorBoundary resetKey="/b"><p>fine now</p></ErrorBoundary>);
    expect(screen.getByText("fine now")).toBeInTheDocument();
  });
});
