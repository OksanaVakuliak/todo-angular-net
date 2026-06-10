import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [PageIntroComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Authentication"
      title="Create account"
      description="Create your account and start an authenticated cookie-backed session."
    />

    <form class="auth-form" [formGroup]="registerForm" (ngSubmit)="submit()">
      <div>
        <label class="form-label" for="registerName">Name</label>
        <input
          id="registerName"
          class="form-control"
          type="text"
          placeholder="Your name"
          autocomplete="name"
          formControlName="displayName"
        />
      </div>

      <div>
        <label class="form-label" for="registerEmail">Email</label>
        <input
          id="registerEmail"
          class="form-control"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          formControlName="email"
        />
      </div>

      <div>
        <label class="form-label" for="registerPassword">Password</label>
        <input
          id="registerPassword"
          class="form-control"
          type="password"
          placeholder="Password"
          autocomplete="new-password"
          formControlName="password"
        />
      </div>

      @if (errorMessage) {
        <p class="alert alert-danger m-0" role="alert">{{ errorMessage }}</p>
      }

      <button
        type="submit"
        class="btn btn-primary w-100"
        [disabled]="registerForm.invalid || isSubmitting"
      >
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>
    </form>

    <p class="auth-switch">
      Already have an account?
      <a routerLink="/login">Sign in</a>
    </p>
  `,
  styleUrl: '../auth-forms.scss'
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  protected errorMessage = '';
  protected isSubmitting = false;

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/tasks'),
        error: (error) => {
          this.errorMessage = this.authService.getErrorMessage(error, 'Unable to create account.');
        }
      });
  }
}
