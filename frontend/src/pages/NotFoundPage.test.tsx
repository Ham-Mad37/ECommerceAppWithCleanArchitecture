import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("names the missing path and links home", () => {
    render(<MemoryRouter initialEntries={["/nope/42"]}><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText("/nope/42")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute("href", "/");
  });
});
