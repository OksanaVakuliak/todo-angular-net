export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string | null;
}
