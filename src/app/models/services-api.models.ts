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
