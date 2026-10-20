import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";
import { storage } from "../utils/storage";

import type {
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "../types/auth";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;

  login: (
    request: LoginRequest
  ) => Promise<UserProfile>;

  register: (
    request: RegisterRequest
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadCurrentUser = async () => {
    const token = storage.getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser =
        await authService.getMe();

      setUser(currentUser);
    } catch {
      storage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (
    request: LoginRequest
  ): Promise<UserProfile> => {
    const response =
      await authService.login(request);

    storage.setAccessToken(
      response.accessToken
    );

    if (response.refreshToken) {
      storage.setRefreshToken(
        response.refreshToken
      );
    }

    const currentUser =
      await authService.getMe();

    setUser(currentUser);

    return currentUser;
  };

  const register = async (
    request: RegisterRequest
  ) => {
    await authService.register(request);
  };

  const logout = async () => {
    const refreshToken =
      storage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(
          refreshToken
        );
      }
    } finally {
      storage.clear();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const currentUser =
      await authService.getMe();

    setUser(currentUser);
  };

  const isAuthenticated =
    user !== null;

  const isAdmin =
    user?.roles?.some(
      role =>
        role.toLowerCase() === "admin"
    ) ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}