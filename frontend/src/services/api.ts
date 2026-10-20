import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { storage } from "../utils/storage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5082/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// One shared refresh call: every request that hits a 401 at the same time waits for it.
let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url?: string) =>
  !!url && /\/auth\/(login|register|refresh)/.test(url);

const requestNewAccessToken = async (): Promise<string> => {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token.");

  // Plain axios (not `api`) so this call can never trigger the interceptor again.
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

  storage.setAccessToken(data.accessToken);
  if (data.refreshToken) storage.setRefreshToken(data.refreshToken);
  return data.accessToken as string;
};

const redirectToLogin = () => {
  storage.clear();
  if (window.location.pathname !== "/login") window.location.href = "/login";
};

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableRequest | undefined;

    // Wrong password on /auth/login is also a 401 - never try to refresh for those.
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= requestNewAccessToken().finally(() => {
        refreshPromise = null;
      });

      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  }
);
