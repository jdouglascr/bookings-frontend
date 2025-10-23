import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBookingCreateRequest, PublicBookingResponse } from '../../models/booking-api.models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/bookings`;

  createBooking(request: PublicBookingCreateRequest): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(this.apiUrl, request);
  }
}
