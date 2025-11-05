// Booking
export interface PublicBookingCreateRequest {
  customerId: number;
  resourceServiceId: number;
  startDatetime: string;
  endDatetime: string;
  price: number;
}

export interface PublicBookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  resourceId: number;
  resourceName: string;
  serviceId: number;
  serviceName: string;
  startDatetime: string;
  endDatetime: string;
  price: number;
  status: string;
}

// Resource
export interface PublicResource {
  resourceServiceId: number;
  resourceId: number;
  name: string;
  description: string;
  imageUrl: string;
}

// Customer
export interface PublicCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PublicCustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Business
export interface PublicBusinessInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  logoUrl: string;
  bannerUrl: string;
  schedule: PublicBusinessHour[];
}

export interface PublicBusinessHour {
  day: string;
  hours: string;
  isOpen: boolean;
}

// Service
export interface PublicServicesResponse {
  categoryId: number;
  categoryName: string;
  services: PublicService[];
}

export interface PublicService {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  price: number;
  priceFormatted: string;
  durationFormatted: string;
}
