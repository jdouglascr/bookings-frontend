import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../../models/shared-api.models';
import { UserRequest, UserResponse } from '../../models/private-api.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/users`;

  users = signal<UserResponse[]>([]);
  isLoading = signal(false);

  loadUsers(): Observable<UserResponse[]> {
    this.isLoading.set(true);
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      tap({
        next: (data) => {
          this.users.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  createUser(request: UserRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.apiUrl, request).pipe(tap(() => this.loadUsers().subscribe()));
  }

  updateUser(id: number, request: UserRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(async () => {
        this.loadUsers().subscribe();
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.id === id) {
          await this.authService.reloadCurrentUser();
        }
      }),
    );
  }

  deleteUser(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`).pipe(tap(() => this.loadUsers().subscribe()));
  }
}
