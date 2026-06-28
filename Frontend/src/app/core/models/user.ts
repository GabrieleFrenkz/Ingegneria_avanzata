export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
