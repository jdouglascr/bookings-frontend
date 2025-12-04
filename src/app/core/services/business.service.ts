import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBusinessInfo } from '../../models/public-api.models';
import {
  BusinessWithHoursResponse,
  BusinessWithHoursUpdateRequest,
} from '../../models/private-api.models';
import { MessageResponse } from '../../models/shared-api.models';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private http = inject(HttpClient);

  private publicApiUrl = `${environment.apiUrl}/public/business`;
  private privateApiUrl = `${environment.apiUrl}/business`;

  // Señal pública
  business = signal<PublicBusinessInfo | null>(null);
  isLoading = signal(false);

  // Señal privada
  businessWithHours = signal<BusinessWithHoursResponse | null>(null);
  isPrivateLoading = signal(false);

  /**
   * Carga información pública del negocio (para website)
   */
  loadBusinessInfo(): void {
    this.isLoading.set(true);
    this.http.get<PublicBusinessInfo>(this.publicApiUrl).subscribe({
      next: (data) => {
        this.business.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading business info:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Carga información del negocio con horarios ordenados
   */
  loadBusinessWithHours(): Observable<BusinessWithHoursResponse> {
    this.isPrivateLoading.set(true);
    return this.http.get<BusinessWithHoursResponse>(this.privateApiUrl).pipe(
      tap((data) => {
        this.businessWithHours.set(data);
        this.isPrivateLoading.set(false);
      }),
      catchError((error) => {
        this.isPrivateLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza negocio y horarios
   */
  updateBusinessWithHours(
    data: BusinessWithHoursUpdateRequest,
    logo?: File,
    banner?: File,
  ): Observable<MessageResponse> {
    this.isPrivateLoading.set(true);

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    if (logo) {
      formData.append('logo', logo);
    }
    if (banner) {
      formData.append('banner', banner);
    }

    return this.http.put<MessageResponse>(this.privateApiUrl, formData).pipe(
      tap(() => {
        this.isPrivateLoading.set(false);
      }),
      catchError((error) => {
        this.isPrivateLoading.set(false);
        return throwError(() => error);
      }),
    );
  }
}
