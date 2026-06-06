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
  styles: [
    `
      .auth-form {
        display: grid;
        gap: 1rem;
      }

      label {
        color: #334155;
        display: grid;
        font-size: 0.9rem;
        font-weight: 700;
        gap: 0.4rem;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 0.5rem;
        color: #0f172a;
        font: inherit;
        padding: 0.75rem 0.85rem;
      }

      input:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.16);
        outline: none;
      }

      button {
        background: #0f766e;
        border: 0;
        border-radius: 0.5rem;
        color: #ffffff;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
        padding: 0.8rem 1rem;
      }

      .auth-switch {
        color: #475569;
        margin: 1rem 0 0;
      }

      .auth-switch a {
        color: #0f766e;
        font-weight: 800;
      }
    `
  ]
})
export class RegisterPageComponent {}
