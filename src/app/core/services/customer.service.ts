import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../../models/shared-api.models';
import { CustomerRequest, CustomerResponse } from '../../models/private-api.models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private publicApiUrl = `${environment.apiUrl}/public/customers`;
  private privateApiUrl = `${environment.apiUrl}/customers`;

  customers = signal<CustomerResponse[]>([]);
  isLoading = signal(false);

  upsertCustomer(request: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.publicApiUrl, request);
  }

  loadCustomers(): Observable<CustomerResponse[]> {
    this.isLoading.set(true);
    return this.http.get<CustomerResponse[]>(this.privateApiUrl).pipe(
      tap({
        next: (data) => {
          this.customers.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getCustomerById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.privateApiUrl}/${id}`);
  }

  getCustomerByEmail(email: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.privateApiUrl}/email/${email}`);
  }

  createCustomer(request: CustomerRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.privateApiUrl, request).pipe(tap(() => this.loadCustomers().subscribe()));
  }

  updateCustomer(id: number, request: CustomerRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.privateApiUrl}/${id}`, request).pipe(tap(() => this.loadCustomers().subscribe()));
  }

  deleteCustomer(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.privateApiUrl}/${id}`).pipe(tap(() => this.loadCustomers().subscribe()));
  }
}
