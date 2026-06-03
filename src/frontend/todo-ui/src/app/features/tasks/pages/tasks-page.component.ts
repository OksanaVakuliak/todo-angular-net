import { Component } from '@angular/core';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-tasks-page',
  imports: [PageIntroComponent],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="Task workspace scaffold"
      description="This page will become the main task list with CRUD actions, pagination, search, and category filtering."
    />
  `
})
export class TasksPageComponent {}
