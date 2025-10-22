import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublicResource } from '../../models/resources-api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public/resources`;

  resources = signal<PublicResource[]>([]);
  isLoading = signal(true);

  loadResourcesByService(serviceId: number) {
    this.isLoading.set(true);

    this.http.get<PublicResource[]>(`${this.apiUrl}/by-service/${serviceId}`).subscribe({
      next: (data) => {
        this.resources.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando recursos:', error);
        this.isLoading.set(false);
      },
    });
  }

  clearResources() {
    this.resources.set([]);
    this.isLoading.set(true);
  }
}
