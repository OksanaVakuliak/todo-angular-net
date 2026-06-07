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
  const staleUser: User = {
    id: 'f6ab8d18-3820-4c7b-8f0f-14d540bb5f2f',
    email: 'stale@example.com',
    displayName: 'Stale User',
    createdAt: '2026-06-06T09:00:00Z',
    updatedAt: '2026-06-06T09:00:00Z'
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

  it('does not let a stale session load overwrite a newer login', () => {
    service.loadSession().subscribe();
    const sessionRequest = httpTestingController.expectOne('/api/auth/me');

    service.login({ email: user.email, password: 'password123' }).subscribe();
    httpTestingController.expectOne('/api/auth/login').flush(authResponse);

    sessionRequest.flush(staleUser);

    expect(service.currentUser()).toEqual(user);
    expect(service.status()).toBe('authenticated');
  });

  it('does not refresh a stale session load after a newer login', () => {
    service.loadSession().subscribe();
    const sessionRequest = httpTestingController.expectOne('/api/auth/me');

    service.login({ email: user.email, password: 'password123' }).subscribe();
    httpTestingController.expectOne('/api/auth/login').flush(authResponse);

    sessionRequest.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    httpTestingController.expectNone('/api/auth/refresh');
    expect(service.currentUser()).toEqual(user);
    expect(service.status()).toBe('authenticated');
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
