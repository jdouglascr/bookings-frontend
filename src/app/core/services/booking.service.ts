import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBookingCreateRequest, PublicBookingResponse } from '../../models/public-api.models';
import { MessageResponse } from '../../models/shared-api.models';
import { BookingResponse, BookingRequest } from '../../models/private-api.models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly publicApiUrl = `${environment.apiUrl}/public/bookings`;
  private readonly privateApiUrl = `${environment.apiUrl}/bookings`;

  bookings = signal<BookingResponse[]>([]);
  isLoading = signal(false);

  createPublicBooking(request: PublicBookingCreateRequest): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(this.publicApiUrl, request);
  }

  confirmBooking(token: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.publicApiUrl}/${token}/confirm`, {});
  }

  cancelBooking(token: string, reason?: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.publicApiUrl}/${token}/cancel`, { reason });
  }

  loadBookings(): Observable<BookingResponse[]> {
    this.isLoading.set(true);
    return this.http.get<BookingResponse[]>(this.privateApiUrl).pipe(
      tap({
        next: (data) => {
          this.bookings.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getBookingsByCustomer(customerId: number): Observable<BookingResponse[]> {
    this.isLoading.set(true);
    const params = new HttpParams().set('customerId', customerId.toString());

    return this.http.get<BookingResponse[]>(this.privateApiUrl, { params }).pipe(
      tap({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
      }),
    );
  }

  createBooking(request: BookingRequest): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(this.privateApiUrl, request)
      .pipe(tap(() => this.loadBookings().subscribe()));
  }

  updateBooking(id: number, request: BookingRequest): Observable<MessageResponse> {
    return this.http
      .put<MessageResponse>(`${this.privateApiUrl}/${id}`, request)
      .pipe(tap(() => this.loadBookings().subscribe()));
  }

  deleteBooking(id: number): Observable<MessageResponse> {
    return this.http
      .delete<MessageResponse>(`${this.privateApiUrl}/${id}`)
      .pipe(tap(() => this.loadBookings().subscribe()));
  }
}
