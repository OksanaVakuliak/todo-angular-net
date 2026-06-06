import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authCredentialsInterceptor } from './auth-credentials.interceptor';
import { AuthService } from './auth.service';

describe('authCredentialsInterceptor', () => {
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

  it('clears session and redirects to login for protected API unauthorized responses', () => {
    spyOn(authService, 'clearSession');
    spyOn(router, 'navigate').and.resolveTo(true);

    httpClient.get('/api/tasks').subscribe({
      error: () => undefined
    });

    httpTestingController
      .expectOne('/api/tasks')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

