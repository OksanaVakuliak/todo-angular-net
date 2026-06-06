import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
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

    this.statusSignal.set('checking');
    this.sessionRequest = this.httpClient.get<User>('/api/auth/me').pipe(
      catchError((error: HttpErrorResponse) =>
        error.status === 401 ? this.refreshSession() : of(null)
      ),
      tap((user) => this.setSession(user)),
      finalize(() => {
        this.sessionLoaded = true;
        this.sessionRequest = undefined;
      }),
      shareReplay(1)
    );

    return this.sessionRequest;
  }

  login(request: LoginRequest): Observable<User> {
    return this.httpClient.post<AuthUserResponse>('/api/auth/login', request).pipe(
      map((response) => response.user),
      tap((user) => this.setSession(user))
    );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.httpClient.post<AuthUserResponse>('/api/auth/register', request).pipe(
      map((response) => response.user),
      tap((user) => this.setSession(user))
    );
  }

  logout(): Observable<void> {
    return this.httpClient.post<void>('/api/auth/logout', {}).pipe(
      catchError(() => of(undefined)),
      tap(() => this.clearSession())
    );
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
    this.statusSignal.set('anonymous');
    this.sessionLoaded = true;
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }

  private refreshSession(): Observable<User | null> {
    return this.httpClient.post<AuthUserResponse>('/api/auth/refresh', {}).pipe(
      map((response) => response.user),
      catchError(() => of(null))
    );
  }

  private setSession(user: User | null): void {
    this.currentUserSignal.set(user);
    this.statusSignal.set(user ? 'authenticated' : 'anonymous');
    this.sessionLoaded = true;
  }
}
