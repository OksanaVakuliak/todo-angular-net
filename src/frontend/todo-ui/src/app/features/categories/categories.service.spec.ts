import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Category } from './category.models';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const category: Category = {
    id: 'b05d82eb-32cd-4e3a-8700-d8b7f68e39f0',
    userId: '8c520c67-35d7-4f5f-85ea-a0332c4c7a15',
    name: 'Work',
    color: '#0f766e',
    createdAt: '2026-06-07T09:00:00Z',
    updatedAt: '2026-06-07T09:00:00Z'
  };

  let service: CategoriesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CategoriesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('lists categories', () => {
    service.listCategories().subscribe((result) => {
      expect(result).toEqual([category]);
    });

    const request = httpTestingController.expectOne('/api/categories');
    expect(request.request.method).toBe('GET');
    request.flush([category]);
  });

  it('creates a category', () => {
    const requestBody = {
      name: category.name,
      color: category.color
    };

    service.createCategory(requestBody).subscribe((result) => {
      expect(result).toEqual(category);
    });

    const request = httpTestingController.expectOne('/api/categories');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush(category);
  });

  it('updates a category', () => {
    service.updateCategory(category.id, { name: 'Home', color: '#2563eb' }).subscribe((result) => {
      expect(result).toEqual({ ...category, name: 'Home', color: '#2563eb' });
    });

    const request = httpTestingController.expectOne(`/api/categories/${category.id}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ name: 'Home', color: '#2563eb' });
    request.flush({ ...category, name: 'Home', color: '#2563eb' });
  });

  it('deletes a category', () => {
    let requestCompleted = false;

    service.deleteCategory(category.id).subscribe(() => {
      requestCompleted = true;
    });

    const request = httpTestingController.expectOne(`/api/categories/${category.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(requestCompleted).toBeTrue();
  });
});
