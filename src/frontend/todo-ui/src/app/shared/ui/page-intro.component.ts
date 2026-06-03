import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-intro',
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
        margin-bottom: 2rem;
      }

      .eyebrow {
        color: #2563eb;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin: 0 0 0.5rem;
        text-transform: uppercase;
      }

      h1 {
        color: #0f172a;
        font-size: 2rem;
        margin: 0 0 0.75rem;
      }

      p {
        color: #475569;
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
