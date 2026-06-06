import { Component } from '@angular/core';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [PageIntroComponent],
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
  `,
  styles: [
    `
      .login-form {
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
    `
  ]
})
export class LoginPageComponent {}
