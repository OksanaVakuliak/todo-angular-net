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
  styles: [
    `
      .task-form {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        display: grid;
        gap: 1rem;
        max-width: 42rem;
        padding: 1.25rem;
      }

      label {
        color: #334155;
        display: grid;
        font-size: 0.9rem;
        font-weight: 700;
        gap: 0.4rem;
      }

      input,
      select,
      textarea {
        border: 1px solid #cbd5e1;
        border-radius: 0.5rem;
        color: #0f172a;
        font: inherit;
        padding: 0.75rem 0.85rem;
      }

      input:focus,
      select:focus,
      textarea:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.16);
        outline: none;
      }

      .actions {
        align-items: center;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }

      .actions a {
        color: #475569;
        font-weight: 800;
        text-decoration: none;
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

      @media (max-width: 520px) {
        .actions {
          align-items: stretch;
          flex-direction: column-reverse;
        }

        .actions a,
        button {
          text-align: center;
          width: 100%;
        }
      }
    `
  ]
})
export class NewTaskPageComponent {}
