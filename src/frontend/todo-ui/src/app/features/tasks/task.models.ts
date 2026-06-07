export interface TaskItem {
  id: string;
  userId: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface TaskListQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

export interface CreateTaskRequest {
  categoryId: string | null;
  title: string;
  description: string | null;
  dueAt: string | null;
}

export interface UpdateTaskRequest {
  categoryId?: string | null;
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  dueAt?: string | null;
}
