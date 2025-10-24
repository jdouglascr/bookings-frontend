import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, ContactInfo } from '../../models/reservation.models';
import { CustomerResponse, CustomerUpsertRequest } from '../../models/customer-api.models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/customers`;

  upsertCustomer(contactInfo: ContactInfo): Observable<CustomerResponse> {
    const request: CustomerUpsertRequest = {
      firstName: contactInfo.firstName,
      lastName: contactInfo.lastName,
      email: contactInfo.email,
      phone: contactInfo.phone,
    };

    return this.http.post<CustomerResponse>(this.apiUrl, request);
  }

  mapToCustomer(response: CustomerResponse): Customer {
    return {
      id: response.id,
      id_business: 1,
      first_name: response.firstName,
      last_name: response.lastName,
      email: response.email,
      phone: response.phone,
    };
  }
}
