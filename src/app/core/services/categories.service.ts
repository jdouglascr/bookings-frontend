import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CategoryRequest, CategoryResponse } from '../../models/admin-api.models';
import { MessageResponse } from '../../models/shared-api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  categories = signal<CategoryResponse[]>([]);
  isLoading = signal(false);

  loadCategories(): Observable<CategoryResponse[]> {
    this.isLoading.set(true);
    return this.http.get<CategoryResponse[]>(this.apiUrl).pipe(
      tap({
        next: (data) => {
          this.categories.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`);
  }

  createCategory(request: CategoryRequest): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(this.apiUrl, request)
      .pipe(tap(() => this.loadCategories().subscribe()));
  }

  updateCategory(id: number, request: CategoryRequest): Observable<MessageResponse> {
    return this.http
      .put<MessageResponse>(`${this.apiUrl}/${id}`, request)
      .pipe(tap(() => this.loadCategories().subscribe()));
  }

  deleteCategory(id: number): Observable<MessageResponse> {
    return this.http
      .delete<MessageResponse>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadCategories().subscribe()));
  }
}
