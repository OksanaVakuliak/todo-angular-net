import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [PageIntroComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Authentication"
      title="Sign in"
      description="Sign in to manage your tasks and keep your session active through secure cookies."
    />

    @if (sessionMessage) {
      <p class="alert alert-info" role="status">{{ sessionMessage }}</p>
    }

    <form class="auth-form" [formGroup]="loginForm" (ngSubmit)="submit()">
      <div>
        <label class="form-label" for="loginEmail">Email</label>
        <input
          id="loginEmail"
          class="form-control"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          formControlName="email"
        />
      </div>

      <div>
        <label class="form-label" for="loginPassword">Password</label>
        <input
          id="loginPassword"
          class="form-control"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          formControlName="password"
        />
      </div>

      @if (errorMessage) {
        <p class="alert alert-danger m-0" role="alert">{{ errorMessage }}</p>
      }

      <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid || isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Continue' }}
      </button>
    </form>

    <p class="auth-switch">
      Need an account?
      <a routerLink="/register">Create one</a>
    </p>
  `,
  styleUrl: '../auth-forms.scss'
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  protected readonly sessionMessage =
    this.route.snapshot.queryParamMap.get('reason') === 'session-expired'
      ? 'Your session expired. Sign in again to continue.'
      : '';
  protected errorMessage = '';
  protected isSubmitting = false;

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/tasks';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.errorMessage = this.authService.getErrorMessage(
            error,
            'Unable to sign in with these credentials.'
          );
        }
      });
  }
}
