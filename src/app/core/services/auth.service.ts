import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, timer, Subscription, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ErrorResponse } from '../../models/shared-api.models';
import { environment } from '../../../environments/environment';
import {
  DecodedToken,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '../../models/private-api.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<CurrentUser | null>(null);
  private _isLoading = signal<boolean>(false);

  private refreshTokenInProgress = new BehaviorSubject<boolean>(false);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private tokenRefreshTimer: Subscription | null = null;

  isAuthenticated = computed(() => this._isAuthenticated());
  currentUser = computed(() => this._currentUser());
  isLoading = computed(() => this._isLoading());
  userRole = computed(() => this._currentUser()?.role || null);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken && !refreshToken) {
      this.clearAuthState();
      return;
    }

    if (accessToken && !this.isTokenExpired(accessToken)) {
      const decoded = this.decodeToken(accessToken);

      if (!decoded || !this.isValidTokenStructure(decoded)) {
        console.warn('Token con estructura inválida detectado, limpiando sesión');
        this.clearAuthState();
        return;
      }

      try {
        await this.loadCurrentUser();
        this._isAuthenticated.set(true);
        this.scheduleTokenRefresh();
      } catch (error) {
        console.error('Error cargando usuario:', error);
        this.clearAuthState();
      }
      return;
    }

    if (refreshToken && !this.isTokenExpired(refreshToken)) {
      try {
        await this.silentRefresh();
      } catch (error) {
        console.error('Error en inicialización:', error);
        this.clearAuthState();
      }
    } else {
      this.clearAuthState();
    }
  }

  private isValidTokenStructure(decoded: DecodedToken): boolean {
    return !!(decoded.email && decoded.role && decoded.type && decoded.exp && decoded.iat);
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<CurrentUser>(`${this.apiUrl}/me`));
      this._currentUser.set(user);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      throw error;
    }
  }

  async reloadCurrentUser(): Promise<void> {
    if (this._isAuthenticated()) {
      await this.loadCurrentUser();
    }
  }

  private clearAuthState(): void {
    this.clearTokens();
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.cancelTokenRefresh();
  }

  private scheduleTokenRefresh(): void {
    this.cancelTokenRefresh();

    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    const decoded = this.decodeToken(accessToken);
    if (!decoded || !decoded.exp) return;

    const expiresAt = decoded.exp * 1000;
    const now = Date.now();
    const refreshTime = expiresAt - now - 5 * 60 * 1000;

    if (refreshTime <= 0) {
      this.silentRefresh();
      return;
    }

    this.tokenRefreshTimer = timer(refreshTime).subscribe(() => {
      this.silentRefresh();
    });
  }

  private cancelTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = null;
    }
  }

  private async silentRefresh(): Promise<void> {
    try {
      const response = await firstValueFrom(this.refreshToken());
      if (response) {
        await this.loadCurrentUser();
        this.scheduleTokenRefresh();
      }
    } catch (error) {
      console.error('Error en renovación silenciosa:', error);
      this.logout();
    }
  }

  async checkSession(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return false;
    }

    if (accessToken && !this.isTokenExpired(accessToken)) {
      if (!this._currentUser()) {
        try {
          await this.loadCurrentUser();
          this._isAuthenticated.set(true);
        } catch (error) {
          console.error(error);
          return false;
        }
      }
      return true;
    }

    if (refreshToken && !this.isTokenExpired(refreshToken)) {
      try {
        await firstValueFrom(this.refreshToken());
        await this.loadCurrentUser();
        this._isAuthenticated.set(true);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }

    return false;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (response) => {
        await this.handleLoginSuccess(response);
      }),
      catchError((error: HttpErrorResponse) => {
        this._isLoading.set(false);
        return throwError(() => error.error as ErrorResponse);
      }),
    );
  }

  private async handleLoginSuccess(response: LoginResponse): Promise<void> {
    this.saveTokens(response.accessToken, response.refreshToken);
    await this.loadCurrentUser();
    this._isAuthenticated.set(true);
    this.scheduleTokenRefresh();
    this._isLoading.set(false);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.isTokenExpired(refreshToken)) {
      this.logout();
      return throwError(() => new Error('Refresh token expired'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError((error: HttpErrorResponse) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.clearAuthState();
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
    const now = new Date();

    return expirationDate.getTime() <= now.getTime() + 1000;
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
