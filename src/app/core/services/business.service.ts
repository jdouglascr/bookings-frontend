import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PublicBusinessInfo } from '../../models/business-api.models';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public/business`;

  business = signal<PublicBusinessInfo | null>(null);
  isLoading = signal(true);

  loadBusinessInfo() {
    this.isLoading.set(true);

    this.http.get<PublicBusinessInfo>(this.apiUrl).subscribe({
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
