import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-intro',
  standalone: true,
  template: `
    <header class="page-intro text-center mb-4">
      <p class="eyebrow text-uppercase fw-bold mb-2">{{ eyebrow() }}</p>
      <h1 class="mb-2">{{ title() }}</h1>
      <p class="description text-secondary mx-auto mb-0">{{ description() }}</p>
    </header>
  `,
  styleUrl: './page-intro.component.scss'
})
export class PageIntroComponent {
  readonly eyebrow = input('Project Setup');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
