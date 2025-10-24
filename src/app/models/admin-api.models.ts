export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: string;
}

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
