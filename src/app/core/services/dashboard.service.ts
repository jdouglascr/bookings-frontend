import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../../models/private-api.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  dashboardStats = signal<DashboardStats | null>(null);
  isLoading = signal(false);

  loadDashboardStats(): Observable<DashboardStats> {
    this.isLoading.set(true);

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
      tap({
        next: (data) => {
          this.dashboardStats.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
    );
  }

  clearStats(): void {
    this.dashboardStats.set(null);
  }
}
