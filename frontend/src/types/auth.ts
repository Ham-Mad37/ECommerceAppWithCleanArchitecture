export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: string | null;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  customerId?: number | null;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}