import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface BusinessInfo {
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
  schedule: BusinessHour[];
}

export interface BusinessHour {
  day: string;
  hours: string;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/public/business';

  business = signal<BusinessInfo | null>(null);
  isLoading = signal(true);

  loadBusinessInfo() {
    this.isLoading.set(true);

    this.http.get<BusinessInfo>(this.apiUrl).subscribe({
      next: (data) => {
        this.business.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando info del negocio:', error);
        this.isLoading.set(false);
      },
    });
  }
}
