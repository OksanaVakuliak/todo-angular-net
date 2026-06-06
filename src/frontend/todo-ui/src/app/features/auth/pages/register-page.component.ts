import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [PageIntroComponent, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Authentication"
      title="Create account"
      description="Registration starts here. The authentication milestone can wire this form to the API without changing the unauthenticated route structure."
    />

    <form class="auth-form">
      <label>
        Name
        <input type="text" placeholder="Your name" autocomplete="name" />
      </label>

      <label>
        Email
        <input type="email" placeholder="you@example.com" autocomplete="email" />
      </label>

      <label>
        Password
        <input type="password" placeholder="Password" autocomplete="new-password" />
      </label>

      <button type="button">Create account</button>
    </form>

    <p class="auth-switch">
      Already have an account?
      <a routerLink="/login">Sign in</a>
    </p>
  `,
  styleUrl: '../auth-forms.scss'
})
export class RegisterPageComponent {}
