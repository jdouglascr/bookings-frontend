import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeekAvailabilityResponse } from '../../models/public-api.models';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/availability`;

  weekAvailability = signal<WeekAvailabilityResponse | null>(null);
  isLoading = signal(false);

  getWeekAvailability(
    resourceServiceId: number,
    startDate: string,
  ): Observable<WeekAvailabilityResponse> {
    this.isLoading.set(true);

    const params = new HttpParams().set('startDate', startDate);

    return this.http
      .get<WeekAvailabilityResponse>(`${this.apiUrl}/${resourceServiceId}/week`, { params })
      .pipe(
        tap({
          next: (data) => {
            this.weekAvailability.set(data);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          },
        }),
      );
  }

  clearAvailability(): void {
    this.weekAvailability.set(null);
  }
}
