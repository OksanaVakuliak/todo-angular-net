import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthUserResponse, User } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user: User = {
    id: '6f89a8f4-6b1f-4d7d-9f31-92f010dc56ab',
    email: 'oksana@example.com',
    displayName: 'Oksana',
    createdAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-06T10:00:00Z'
  };
  const authResponse: AuthUserResponse = { user };

  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('stores the authenticated user after login', () => {
    service.login({ email: user.email, password: 'password123' }).subscribe((result) => {
      expect(result).toEqual(user);
    });

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush(authResponse);

    expect(service.currentUser()).toEqual(user);
    expect(service.status()).toBe('authenticated');
  });

  it('loads the current cookie session from the backend', () => {
    service.loadSession().subscribe((result) => {
      expect(result).toEqual(user);
    });

    const request = httpTestingController.expectOne('/api/auth/me');
    expect(request.request.method).toBe('GET');
    request.flush(user);

    expect(service.currentUser()).toEqual(user);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('refreshes the session when the current user request is unauthorized', () => {
    service.loadSession().subscribe((result) => {
      expect(result).toEqual(user);
    });

    httpTestingController
      .expectOne('/api/auth/me')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTestingController.expectOne('/api/auth/refresh');
    expect(refreshRequest.request.method).toBe('POST');
    refreshRequest.flush(authResponse);

    expect(service.currentUser()).toEqual(user);
    expect(service.status()).toBe('authenticated');
  });

  it('clears the current session after logout', () => {
    service.login({ email: user.email, password: 'password123' }).subscribe();
    httpTestingController.expectOne('/api/auth/login').flush(authResponse);

    service.logout().subscribe();
    const request = httpTestingController.expectOne('/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(service.currentUser()).toBeNull();
    expect(service.status()).toBe('anonymous');
  });
});

