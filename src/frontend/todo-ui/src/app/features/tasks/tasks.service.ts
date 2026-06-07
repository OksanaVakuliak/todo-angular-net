import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Category,
  CreateTaskRequest,
  PagedResult,
  TaskItem,
  TaskListQuery,
  UpdateTaskRequest
} from './task.models';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly httpClient = inject(HttpClient);

  listTasks(query: TaskListQuery): Observable<PagedResult<TaskItem>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }

    return this.httpClient.get<PagedResult<TaskItem>>('/api/tasks', { params });
  }

  getTask(taskId: string): Observable<TaskItem> {
    return this.httpClient.get<TaskItem>(`/api/tasks/${taskId}`);
  }

  createTask(request: CreateTaskRequest): Observable<TaskItem> {
    return this.httpClient.post<TaskItem>('/api/tasks', request);
  }

  updateTask(taskId: string, request: UpdateTaskRequest): Observable<TaskItem> {
    return this.httpClient.patch<TaskItem>(`/api/tasks/${taskId}`, request);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.httpClient.delete<void>(`/api/tasks/${taskId}`);
  }

  listCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>('/api/categories');
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }
}
