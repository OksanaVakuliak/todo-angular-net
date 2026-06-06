import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [PageIntroComponent, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Authentication"
      title="Sign in"
      description="The authentication flow starts here. Form wiring, token handling, and route guards can attach to this page without changing the route structure."
    />

    <form class="login-form">
      <label>
        Email
        <input type="email" placeholder="you@example.com" autocomplete="email" />
      </label>

      <label>
        Password
        <input type="password" placeholder="Password" autocomplete="current-password" />
      </label>

      <button type="button">Continue</button>
    </form>

    <p class="auth-switch">
      Need an account?
      <a routerLink="/register">Create one</a>
    </p>
  `,
  styleUrl: '../auth-forms.scss'
})
export class LoginPageComponent {}
