import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getApiError, money } from "./format";

const apiError = (status: number, data: unknown) =>
  new AxiosError("fail", "ERR", undefined, undefined, { status, data } as AxiosResponse);

describe("getApiError", () => {
  it("reads ProblemDetails detail", () => expect(getApiError(apiError(409, { detail: "Out of stock" }))).toBe("Out of stock"));
  it("falls back to title", () => expect(getApiError(apiError(400, { title: "Bad request" }))).toBe("Bad request"));
  it("reads the first validation error", () =>
    expect(getApiError(apiError(400, { errors: { Email: ["Email is invalid"] } }))).toBe("Email is invalid"));
  it("accepts a plain string body", () => expect(getApiError(apiError(400, "Nope"))).toBe("Nope"));
  it("reports an unreachable server", () => expect(getApiError(new AxiosError("Network Error"))).toContain("Cannot reach the server"));
  it("uses the fallback for unknown errors", () => expect(getApiError(new Error("x"), "Custom")).toBe("Custom"));
});

describe("money", () => {
  it("formats with two decimals", () => expect(money(5)).toContain("5.00"));
});
