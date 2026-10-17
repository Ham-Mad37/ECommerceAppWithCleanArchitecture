import { api } from "./api";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
} from "../types/auth";

export const authService = {
  async login(
    request: LoginRequest
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      request
    );

    return response.data;
  },

  async register(
    request: RegisterRequest
  ): Promise<void> {
    await api.post(
      "/auth/register",
      request
    );
  },

  async getMe(): Promise<UserProfile> {
    const response =
      await api.get<UserProfile>("/auth/me");

    return response.data;
  },

  async updateProfile(
    request: unknown
  ): Promise<void> {
    await api.put("/auth/me", request);
  },

  async changePassword(
    request: unknown
  ): Promise<void> {
    await api.post(
      "/auth/change-password",
      request
    );
  },

  async logout(
    refreshToken: string
  ): Promise<void> {
    await api.post("/auth/logout", {
      refreshToken,
    });
  },
};