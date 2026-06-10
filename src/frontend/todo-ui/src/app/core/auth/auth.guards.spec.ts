import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User } from './auth.models';
import { authGuard, publicOnlyGuard } from './auth.guards';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  const user: User = {
    id: '6f89a8f4-6b1f-4d7d-9f31-92f010dc56ab',
    email: 'oksana@example.com',
    displayName: 'Oksana',
    createdAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-06T10:00:00Z'
  };

  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['loadSession']);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('allows authenticated users into protected routes', (done) => {
    authService.loadSession.and.returnValue(of(user));

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, { url: '/tasks' } as RouterStateSnapshot);

      asObservable(result).subscribe((guardResult) => {
        expect(guardResult).toBeTrue();
        done();
      });
    });
  });

  it('redirects anonymous users to login with the original return URL', (done) => {
    authService.loadSession.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, { url: '/tasks/new' } as RouterStateSnapshot);

      asObservable(result).subscribe((guardResult) => {
        expect(router.serializeUrl(guardResult as UrlTree)).toBe('/login?returnUrl=%2Ftasks%2Fnew');
        done();
      });
    });
  });

  it('redirects authenticated users away from public auth pages', (done) => {
    authService.loadSession.and.returnValue(of(user));

    TestBed.runInInjectionContext(() => {
      const result = publicOnlyGuard({} as never, { url: '/login' } as RouterStateSnapshot);

      asObservable(result).subscribe((guardResult) => {
        expect(router.serializeUrl(guardResult as UrlTree)).toBe('/tasks');
        done();
      });
    });
  });

  it('allows anonymous users to visit public auth pages', (done) => {
    authService.loadSession.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      const result = publicOnlyGuard({} as never, { url: '/login' } as RouterStateSnapshot);

      asObservable(result).subscribe((guardResult) => {
        expect(guardResult).toBeTrue();
        done();
      });
    });
  });
});

function asObservable<T>(result: T | Observable<T>): Observable<T> {
  return result instanceof Observable ? result : of(result);
}
