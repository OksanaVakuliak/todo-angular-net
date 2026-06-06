import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-new-task-page',
  standalone: true,
  imports: [PageIntroComponent, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="New task"
      description="Creation flow route for the task form. API submission and validation can be wired during the task CRUD milestone."
    />

    <form class="task-form">
      <label>
        Title
        <input type="text" placeholder="Task title" />
      </label>

      <label>
        Description
        <textarea rows="5" placeholder="Add details"></textarea>
      </label>

      <label>
        Category
        <select>
          <option>General</option>
          <option>Work</option>
          <option>Personal</option>
        </select>
      </label>

      <div class="actions">
        <a routerLink="/tasks">Cancel</a>
        <button type="button">Create task</button>
      </div>
    </form>
  `,
  styleUrl: './new-task-page.component.scss'
})
export class NewTaskPageComponent {}
