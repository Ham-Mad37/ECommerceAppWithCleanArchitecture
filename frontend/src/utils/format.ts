import axios from "axios";

export const money = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Turns any API failure into one readable sentence (handles ProblemDetails + validation `errors`). */
export function getApiError(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach the server. Is the API running?";

    const data = error.response.data as
      | { errors?: Record<string, string[]>; detail?: string; title?: string }
      | string
      | undefined;

    if (typeof data === "string" && data) return data;

    if (data && typeof data === "object") {
      if (data.errors) {
        const messages = Object.values(data.errors).flat();
        if (messages.length) return messages.join(" ");
      }
      if (data.detail) return data.detail;
      if (data.title) return data.title;
    }
  }
  return fallback;
}

export const toDateInput = (date: Date): string => date.toISOString().slice(0, 10);
