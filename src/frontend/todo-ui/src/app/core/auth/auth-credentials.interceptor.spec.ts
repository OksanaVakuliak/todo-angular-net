import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authCredentialsInterceptor } from './auth-credentials.interceptor';
import { AuthUserResponse, User } from './auth.models';
import { AuthService } from './auth.service';

describe('authCredentialsInterceptor', () => {
  const user: User = {
    id: '6f89a8f4-6b1f-4d7d-9f31-92f010dc56ab',
    email: 'oksana@example.com',
    displayName: 'Oksana',
    createdAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-06T10:00:00Z'
  };
  const authResponse: AuthUserResponse = { user };

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authCredentialsInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sends credentials for API requests without adding bearer authorization', () => {
    httpClient.get('/api/tasks').subscribe();

    const request = httpTestingController.expectOne('/api/tasks');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush([]);
  });

  it('does not force credentials for non-API requests', () => {
    httpClient.get('/assets/config.json').subscribe();

    const request = httpTestingController.expectOne('/assets/config.json');
    expect(request.request.withCredentials).toBeFalse();
    request.flush({});
  });

  it('refreshes the session and retries protected API unauthorized responses', () => {
    httpClient.get('/api/tasks').subscribe((result) => {
      expect(result).toEqual([]);
    });

    httpTestingController
      .expectOne('/api/tasks')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTestingController.expectOne('/api/auth/refresh');
    expect(refreshRequest.request.withCredentials).toBeTrue();
    refreshRequest.flush(authResponse);

    const retryRequest = httpTestingController.expectOne('/api/tasks');
    expect(retryRequest.request.withCredentials).toBeTrue();
    retryRequest.flush([]);

    expect(authService.currentUser()).toEqual(user);
  });

  it('clears session and redirects to login when refresh cannot recover the session', () => {
    spyOn(authService, 'clearSession');
    spyOnProperty(router, 'url', 'get').and.returnValue('/tasks');
    spyOn(router, 'navigate').and.resolveTo(true);

    httpClient.get('/api/tasks').subscribe({
      error: () => undefined
    });

    httpTestingController
      .expectOne('/api/tasks')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    httpTestingController
      .expectOne('/api/auth/refresh')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/tasks',
        reason: 'session-expired'
      }
    });
  });

  it('does not clear session or redirect for auth endpoint unauthorized responses', () => {
    spyOn(authService, 'clearSession');
    spyOnProperty(router, 'url', 'get').and.returnValue('/tasks');
    spyOn(router, 'navigate').and.resolveTo(true);

    httpClient.get('/api/auth/refresh').subscribe({
      error: () => undefined
    });

    httpTestingController
      .expectOne('/api/auth/refresh')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
