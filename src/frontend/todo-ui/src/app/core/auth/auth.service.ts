import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, defer, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { AuthStatus, AuthUserResponse, LoginRequest, RegisterRequest, User } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly statusSignal = signal<AuthStatus>('checking');
  private sessionRequest?: Observable<User | null>;
  private sessionLoaded = false;
  private sessionVersion = 0;

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.statusSignal() === 'authenticated');

  loadSession(): Observable<User | null> {
    if (this.sessionLoaded) {
      return of(this.currentUserSignal());
    }

    if (this.sessionRequest) {
      return this.sessionRequest;
    }

    const version = this.sessionVersion;
    this.statusSignal.set('checking');
    this.sessionRequest = this.httpClient.get<User>('/api/auth/me').pipe(
      tap((user) => this.setSessionIfCurrent(version, user)),
      catchError((error: HttpErrorResponse) =>
        error.status === 401 && version === this.sessionVersion
          ? this.refreshSession()
          : this.clearSessionIfCurrent(version)
      ),
      finalize(() => {
        if (version === this.sessionVersion) {
          this.sessionLoaded = true;
        }

        this.sessionRequest = undefined;
      }),
      shareReplay(1)
    );

    return this.sessionRequest;
  }

  login(request: LoginRequest): Observable<User> {
    return defer(() => {
      const version = this.beginSessionMutation();

      return this.httpClient.post<AuthUserResponse>('/api/auth/login', request).pipe(
        map((response) => response.user),
        tap((user) => this.setSessionIfCurrent(version, user))
      );
    });
  }

  register(request: RegisterRequest): Observable<User> {
    return defer(() => {
      const version = this.beginSessionMutation();

      return this.httpClient.post<AuthUserResponse>('/api/auth/register', request).pipe(
        map((response) => response.user),
        tap((user) => this.setSessionIfCurrent(version, user))
      );
    });
  }

  logout(): Observable<void> {
    return defer(() => {
      const version = this.beginSessionMutation();

      return this.httpClient.post<void>('/api/auth/logout', {}).pipe(
        catchError(() => of(undefined)),
        tap(() => this.clearSessionIfCurrent(version))
      );
    });
  }

  clearSession(): void {
    const version = this.beginSessionMutation();
    this.clearSessionIfCurrent(version);
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }

  private refreshSession(): Observable<User | null> {
    return defer(() => {
      const version = this.beginSessionMutation();

      return this.httpClient.post<AuthUserResponse>('/api/auth/refresh', {}).pipe(
        map((response) => response.user),
        tap((user) => this.setSessionIfCurrent(version, user)),
        catchError(() => this.clearSessionIfCurrent(version))
      );
    });
  }

  private beginSessionMutation(): number {
    this.sessionVersion += 1;
    this.sessionRequest = undefined;

    return this.sessionVersion;
  }

  private clearSessionIfCurrent(version: number): Observable<null> {
    if (version === this.sessionVersion) {
      this.currentUserSignal.set(null);
      this.statusSignal.set('anonymous');
      this.sessionLoaded = true;
    }

    return of(null);
  }

  private setSessionIfCurrent(version: number, user: User | null): void {
    if (version !== this.sessionVersion) {
      return;
    }

    this.currentUserSignal.set(user);
    this.statusSignal.set(user ? 'authenticated' : 'anonymous');
    this.sessionLoaded = true;
  }
}
