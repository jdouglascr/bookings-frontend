export interface PublicBookingCreateRequest {
  customerId: number;
  resourceServiceId: number;
  startDatetime: string;
  endDatetime: string;
  price: number;
  notes?: string;
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
  notes: string | null;
}

export interface PublicResource {
  resourceServiceId: number;
  resourceId: number;
  name: string;
  description: string;
  imageUrl: string;
}
