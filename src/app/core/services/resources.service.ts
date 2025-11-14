import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { PublicResource } from '../../models/public-api.models';
import { ResourceResponse, ResourceRequest } from '../../models/private-api.models';
import { MessageResponse } from '../../models/shared-api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  private http = inject(HttpClient);
  private publicApiUrl = `${environment.apiUrl}/public/resources`;
  private privateApiUrl = `${environment.apiUrl}/resources`;

  // Señal pública
  resources = signal<PublicResource[]>([]);
  isLoading = signal(true);

  // Señal privada
  privateResources = signal<ResourceResponse[]>([]);
  isPrivateLoading = signal(false);

  /**
   * Carga recursos por servicio (para website)
   */
  loadResourcesByService(serviceId: number): void {
    this.isLoading.set(true);

    this.http.get<PublicResource[]>(`${this.publicApiUrl}/by-service/${serviceId}`).subscribe({
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

  clearResources(): void {
    this.resources.set([]);
    this.isLoading.set(true);
  }

  /**
   * Carga todos los recursos
   */
  getAllResources(): Observable<ResourceResponse[]> {
    this.isPrivateLoading.set(true);

    return this.http.get<ResourceResponse[]>(this.privateApiUrl).pipe(
      tap({
        next: (data) => {
          this.privateResources.set(data);
          this.isPrivateLoading.set(false);
        },
        error: () => this.isPrivateLoading.set(false),
      }),
    );
  }

  /**
   * Carga recursos por usuario
   */
  getResourcesByUser(userId: number): Observable<ResourceResponse[]> {
    this.isPrivateLoading.set(true);

    return this.http.get<ResourceResponse[]>(`${this.privateApiUrl}?userId=${userId}`).pipe(
      tap({
        next: (data) => {
          this.privateResources.set(data);
          this.isPrivateLoading.set(false);
        },
        error: () => this.isPrivateLoading.set(false),
      }),
    );
  }

  /**
   * Crea un nuevo recurso con imagen
   */
  createResource(data: ResourceRequest, image: File): Observable<ResourceResponse> {
    this.isPrivateLoading.set(true);

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);

    return this.http.post<ResourceResponse>(this.privateApiUrl, formData).pipe(
      tap(() => this.isPrivateLoading.set(false)),
      catchError((error) => {
        this.isPrivateLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza un recurso con imagen opcional
   */
  updateResource(id: number, data: ResourceRequest, image?: File): Observable<ResourceResponse> {
    this.isPrivateLoading.set(true);

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    if (image) {
      formData.append('image', image);
    }

    return this.http.put<ResourceResponse>(`${this.privateApiUrl}/${id}`, formData).pipe(
      tap(() => this.isPrivateLoading.set(false)),
      catchError((error) => {
        this.isPrivateLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Elimina un recurso
   */
  deleteResource(id: number): Observable<MessageResponse> {
    this.isPrivateLoading.set(true);

    return this.http.delete<MessageResponse>(`${this.privateApiUrl}/${id}`).pipe(
      tap(() => this.isPrivateLoading.set(false)),
      catchError((error) => {
        this.isPrivateLoading.set(false);
        return throwError(() => error);
      }),
    );
  }
}
