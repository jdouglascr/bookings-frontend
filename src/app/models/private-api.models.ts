// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  email: string;
  role: string;
  type: string;
  iat: number;
  exp: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
}

// Category
export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: string;
}

export interface CategoryWithServices {
  category: CategoryResponse;
  services: ServiceResponse[];
  servicesCount: number;
}

// Service
export interface ServiceRequest {
  categoryId: number;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  bufferTimeMin: number;
  price: number;
}

export interface ServiceResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  bufferTimeMin: number;
  price: number;
  createdAt: string;
}

// User
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'ROLE_ADMIN' | 'ROLE_STAFF';
  isActive?: boolean;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
