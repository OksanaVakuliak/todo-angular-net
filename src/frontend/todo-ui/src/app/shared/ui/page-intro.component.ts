import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-intro',
  standalone: true,
  template: `
    <header class="page-intro">
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
    </header>
  `,
  styles: [
    `
      .page-intro {
        margin-bottom: 1.5rem;
      }

      .eyebrow {
        color: #0f766e;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0;
        margin: 0 0 0.5rem;
        text-transform: uppercase;
      }

      h1 {
        color: #0f172a;
        font-size: 2rem;
        line-height: 1.15;
        margin: 0 0 0.75rem;
      }

      p {
        color: #475569;
        line-height: 1.6;
        margin: 0;
        max-width: 48rem;
      }
    `
  ]
})
export class PageIntroComponent {
  readonly eyebrow = input('Project Setup');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
