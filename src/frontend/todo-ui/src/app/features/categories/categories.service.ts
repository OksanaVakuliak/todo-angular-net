import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from './category.models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly httpClient = inject(HttpClient);

  listCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>('/api/categories');
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.httpClient.post<Category>('/api/categories', request);
  }

  updateCategory(categoryId: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.httpClient.patch<Category>(`/api/categories/${categoryId}`, request);
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.httpClient.delete<void>(`/api/categories/${categoryId}`);
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }
}
