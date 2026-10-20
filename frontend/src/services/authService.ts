import { api } from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest, UserProfile } from "../types/auth";

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> =>
    (await api.post<LoginResponse>("/auth/login", request)).data,
  register: async (request: RegisterRequest): Promise<void> => {
    await api.post("/auth/register", request);
  },
  getMe: async (): Promise<UserProfile> => (await api.get<UserProfile>("/auth/me")).data,
  updateProfile: async (request: { firstName: string; lastName: string }): Promise<void> => {
    await api.put("/auth/me", request);
  },
  changePassword: async (request: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post("/auth/change-password", request);
  },
  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },
};
