import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { Category, CreateTaskRequest } from '../task.models';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-new-task-page',
  standalone: true,
  imports: [PageIntroComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="New task"
      description="Capture the task details and add it to your list."
    />

    <form class="task-form" [formGroup]="taskForm" (ngSubmit)="createTask()">
      <label>
        Title
        <input
          type="text"
          formControlName="title"
          maxlength="200"
          placeholder="Task title"
          required
        />
      </label>

      <label>
        Description
        <textarea
          rows="5"
          formControlName="description"
          maxlength="2000"
          placeholder="Add details"
        ></textarea>
      </label>

      <div class="form-grid">
        <label>
          Category
          <select formControlName="categoryId">
            <option value="">No category</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </label>

        <label>
          Due date
          <input type="datetime-local" formControlName="dueAt" />
        </label>
      </div>

      @if (errorMessage()) {
        <p class="form-alert">{{ errorMessage() }}</p>
      }

      <div class="actions">
        <a routerLink="/tasks">Cancel</a>
        <button type="submit" [disabled]="taskForm.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Creating...' : 'Create task' }}
        </button>
      </div>
    </form>
  `,
  styleUrl: './new-task-page.component.scss'
})
export class NewTaskPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    categoryId: [''],
    dueAt: ['']
  });

  constructor() {
    this.loadCategories();
  }

  protected createTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.tasksService
      .createTask(this.buildCreateRequest())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/tasks'),
        error: (error) => {
          this.errorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to create the task.')
          );
          this.isSubmitting.set(false);
        }
      });
  }

  private buildCreateRequest(): CreateTaskRequest {
    const formValue = this.taskForm.getRawValue();

    return {
      categoryId: formValue.categoryId || null,
      title: formValue.title.trim(),
      description: formValue.description.trim() || null,
      dueAt: formValue.dueAt ? new Date(formValue.dueAt).toISOString() : null
    };
  }

  private loadCategories(): void {
    this.tasksService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: () => this.categories.set([])
      });
  }
}
