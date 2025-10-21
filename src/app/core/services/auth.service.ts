import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  errors: object;
  timestamp: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  userId: number;
  type: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8080/api/auth';

  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<DecodedToken | null>(null);
  private _isLoading = signal<boolean>(false);

  private refreshTokenInProgress = new BehaviorSubject<boolean>(false);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  isAuthenticated = computed(() => this._isAuthenticated());
  currentUser = computed(() => this._currentUser());
  isLoading = computed(() => this._isLoading());
  userRole = computed(() => this._currentUser()?.role || null);

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const accessToken = this.getAccessToken();
    if (accessToken && !this.isTokenExpired(accessToken)) {
      this._isAuthenticated.set(true);
      this._currentUser.set(this.decodeToken(accessToken));
    } else {
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        this._isAuthenticated.set(true);
      } else {
        this.clearTokens();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.handleLoginSuccess(response);
      }),
      catchError((error: HttpErrorResponse) => {
        this._isLoading.set(false);
        return throwError(() => error.error as ErrorResponse);
      }),
    );
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.saveTokens(response.accessToken, response.refreshToken);
    this._isAuthenticated.set(true);
    this._currentUser.set(this.decodeToken(response.accessToken));
    this._isLoading.set(false);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this._currentUser.set(this.decodeToken(response.accessToken));
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.clearTokens();
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  }

  isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    return expirationDate.getTime() - now.getTime() < fiveMinutes;
  }

  get isRefreshingToken(): boolean {
    return this.refreshTokenInProgress.value;
  }

  setRefreshingToken(value: boolean): void {
    this.refreshTokenInProgress.next(value);
  }

  get refreshTokenSubject$() {
    return this.refreshTokenSubject.asObservable();
  }
}
