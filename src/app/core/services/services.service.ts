import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ServiceRequest, ServiceResponse } from '../../models/admin-api.models';
import { MessageResponse } from '../../models/shared-api.models';
import { environment } from '../../../environments/environment';
import { PublicServicesResponse } from '../../models/services-api.models';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private publicApiUrl = `${environment.apiUrl}/public/services`;
  private privateApiUrl = `${environment.apiUrl}/services`;

  categories = signal<PublicServicesResponse[]>([]);
  services = signal<ServiceResponse[]>([]);
  isLoading = signal(true);

  loadServices() {
    this.isLoading.set(true);

    this.http.get<PublicServicesResponse[]>(this.publicApiUrl).subscribe({
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

  privateLoadServices(categoryId?: number): Observable<ServiceResponse[]> {
    this.isLoading.set(true);
    const url = categoryId ? `${this.privateApiUrl}?categoryId=${categoryId}` : this.privateApiUrl;

    return this.http.get<ServiceResponse[]>(url).pipe(
      tap({
        next: (data) => {
          this.services.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getServiceById(id: number): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.privateApiUrl}/${id}`);
  }

  createService(request: ServiceRequest): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(this.privateApiUrl, request)
      .pipe(tap(() => this.privateLoadServices().subscribe()));
  }

  updateService(id: number, request: ServiceRequest): Observable<MessageResponse> {
    return this.http
      .put<MessageResponse>(`${this.privateApiUrl}/${id}`, request)
      .pipe(tap(() => this.privateLoadServices().subscribe()));
  }

  deleteService(id: number): Observable<MessageResponse> {
    return this.http
      .delete<MessageResponse>(`${this.privateApiUrl}/${id}`)
      .pipe(tap(() => this.privateLoadServices().subscribe()));
  }
}
