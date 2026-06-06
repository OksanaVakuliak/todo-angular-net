import { Component } from '@angular/core';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [PageIntroComponent],
  template: `
    <app-page-intro
      eyebrow="Categories"
      title="Categories"
      description="Management route for category CRUD and task assignment helpers."
    />
  `
})
export class CategoriesPageComponent {}
