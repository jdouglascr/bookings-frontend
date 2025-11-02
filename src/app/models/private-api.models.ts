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
  sub: string;
  role: string;
  userId: number;
  type: string;
  iat: number;
  exp: number;
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

export interface CategoryWithServices {
  category: CategoryResponse;
  services: ServiceResponse[];
  servicesCount: number;
}
