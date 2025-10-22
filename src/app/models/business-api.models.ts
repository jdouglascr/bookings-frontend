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
