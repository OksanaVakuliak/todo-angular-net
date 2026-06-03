import { Component } from '@angular/core';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-login-page',
  imports: [PageIntroComponent],
  template: `
    <app-page-intro
      eyebrow="Authentication"
      title="Login flow placeholder"
      description="This page will host the sign-in form, token handling, and route guard integration in the next milestone."
    />
  `
})
export class LoginPageComponent {}
