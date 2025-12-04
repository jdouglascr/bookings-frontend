import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../../models/shared-api.models';
import { UpdateProfileRequest } from '../../models/private-api.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/auth/me`;

  updateProfile(request: UpdateProfileRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(this.apiUrl, request).pipe(
      tap(async () => {
        await this.authService.reloadCurrentUser();
      }),
    );
  }
}
