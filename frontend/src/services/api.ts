import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
} from "axios";

import { storage } from "../utils/storage";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5082/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

let refreshSubscribers: Array<
  (token: string) => void
> = [];

const subscribeToRefresh = (
  callback: (token: string) => void
) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const redirectToLogin = () => {
  storage.clear();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = storage.getRefreshToken();

    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeToRefresh((newToken) => {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {
          refreshToken,
        }
      );

      const data = response.data;

      storage.setAccessToken(data.accessToken);

      if (data.refreshToken) {
        storage.setRefreshToken(data.refreshToken);
      }

      notifyRefreshSubscribers(data.accessToken);

      if (!originalRequest.headers) {
        originalRequest.headers = {};
      }

      originalRequest.headers.Authorization =
        `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      storage.clear();
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);