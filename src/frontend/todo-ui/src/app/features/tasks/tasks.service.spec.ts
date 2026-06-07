import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Category, PagedResult, TaskItem } from './task.models';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const task: TaskItem = {
    id: '3f6f7af5-50ac-4af4-bf6b-603e6b7468f0',
    userId: '8c520c67-35d7-4f5f-85ea-a0332c4c7a15',
    categoryId: 'b05d82eb-32cd-4e3a-8700-d8b7f68e39f0',
    categoryName: 'Work',
    title: 'Review task UI',
    description: 'Check CRUD screens',
    isCompleted: false,
    dueAt: '2026-06-08T09:00:00Z',
    createdAt: '2026-06-07T09:00:00Z',
    updatedAt: '2026-06-07T09:00:00Z'
  };
  const category: Category = {
    id: 'b05d82eb-32cd-4e3a-8700-d8b7f68e39f0',
    userId: '8c520c67-35d7-4f5f-85ea-a0332c4c7a15',
    name: 'Work',
    color: '#0f766e',
    createdAt: '2026-06-07T09:00:00Z',
    updatedAt: '2026-06-07T09:00:00Z'
  };
  const pagedTasks: PagedResult<TaskItem> = {
    items: [task],
    page: 2,
    limit: 10,
    totalItems: 12,
    totalPages: 2
  };

  let service: TasksService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TasksService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('lists tasks with pagination, search, and category filters', () => {
    service
      .listTasks({
        page: 2,
        limit: 10,
        search: ' review ',
        categoryId: category.id
      })
      .subscribe((result) => {
        expect(result).toEqual(pagedTasks);
      });

    const request = httpTestingController.expectOne(
      '/api/tasks?page=2&limit=10&search=review&categoryId=b05d82eb-32cd-4e3a-8700-d8b7f68e39f0'
    );
    expect(request.request.method).toBe('GET');
    request.flush(pagedTasks);
  });

  it('creates a task', () => {
    const requestBody = {
      categoryId: category.id,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt
    };

    service.createTask(requestBody).subscribe((result) => {
      expect(result).toEqual(task);
    });

    const request = httpTestingController.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush(task);
  });

  it('updates a task', () => {
    service.updateTask(task.id, { title: 'Updated task', isCompleted: true }).subscribe((result) => {
      expect(result).toEqual({ ...task, title: 'Updated task', isCompleted: true });
    });

    const request = httpTestingController.expectOne(`/api/tasks/${task.id}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ title: 'Updated task', isCompleted: true });
    request.flush({ ...task, title: 'Updated task', isCompleted: true });
  });

  it('deletes a task', () => {
    let requestCompleted = false;

    service.deleteTask(task.id).subscribe(() => {
      requestCompleted = true;
    });

    const request = httpTestingController.expectOne(`/api/tasks/${task.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(requestCompleted).toBeTrue();
  });

  it('lists categories for task forms and filters', () => {
    service.listCategories().subscribe((result) => {
      expect(result).toEqual([category]);
    });

    const request = httpTestingController.expectOne('/api/categories');
    expect(request.request.method).toBe('GET');
    request.flush([category]);
  });
});
