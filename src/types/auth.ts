export type UserRole = 'ROLE_CITIZEN' | 'ROLE_OPERATIONS' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  active?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface CreateStaffCredentials {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role: 'ROLE_OPERATIONS' | 'ROLE_ADMIN';
}

export interface ResetPasswordCredentials {
  email: string;
  newPassword: string;
}

export interface UpdateProfileCredentials {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}
