import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBookingCreateRequest, PublicBookingResponse } from '../../models/booking-api.models';
import { MessageResponse } from '../../models/shared-api.models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/bookings`;

  createBooking(request: PublicBookingCreateRequest): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(this.apiUrl, request);
  }

  confirmBooking(token: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/${token}/confirm`, {});
  }

  cancelBooking(token: string, reason?: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/${token}/cancel`, { reason });
  }
}
