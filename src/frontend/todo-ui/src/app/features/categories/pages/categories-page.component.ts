import { Component } from '@angular/core';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-categories-page',
  imports: [PageIntroComponent],
  template: `
    <app-page-intro
      eyebrow="Categories"
      title="Categories management scaffold"
      description="This page will contain category CRUD and category assignment helpers for tasks."
    />
  `
})
export class CategoriesPageComponent {}
