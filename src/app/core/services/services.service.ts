import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublicServicesResponse } from '../../models/services-api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public/services`;

  categories = signal<PublicServicesResponse[]>([]);
  isLoading = signal(true);

  loadServices() {
    this.isLoading.set(true);

    this.http.get<PublicServicesResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        this.isLoading.set(false);
      },
    });
  }
}
