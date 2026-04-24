export type UserRole = "admin" | "manager" | "seller" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string; // Alias for compatibility with legacy AuthContext
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  department?: string;
  isActive: boolean;
  companyId?: string;
  companyName?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}


export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  phone?: string;
  inviteToken?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}
