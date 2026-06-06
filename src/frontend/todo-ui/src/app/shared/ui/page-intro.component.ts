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
  styleUrl: './page-intro.component.scss'
})
export class PageIntroComponent {
  readonly eyebrow = input('Project Setup');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
