import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../categories/category.models';
import { CategoriesService } from '../../categories/categories.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { CreateTaskRequest } from '../task.models';
import { toDueAtIsoString } from '../task-date.utils';
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

    <form class="task-form card" [formGroup]="taskForm" (ngSubmit)="createTask()">
      <div class="mb-3">
        <label class="form-label" for="newTaskTitle">Title</label>
        <input
          id="newTaskTitle"
          class="form-control"
          type="text"
          formControlName="title"
          maxlength="200"
          placeholder="Task title"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="newTaskDescription">Description</label>
        <textarea
          id="newTaskDescription"
          class="form-control"
          rows="5"
          formControlName="description"
          maxlength="2000"
          placeholder="Add details"
        ></textarea>
      </div>

      <div class="row g-3">
        <div class="col-12 col-sm-6">
          <label class="form-label" for="newTaskCategory">Category</label>
          <select
            id="newTaskCategory"
            class="form-select"
            formControlName="categoryId"
            [attr.disabled]="isLoadingCategories() ? '' : null"
          >
            @if (isLoadingCategories()) {
              <option value="">Loading categories...</option>
            } @else {
              <option value="">No category</option>
              @for (category of categories(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            }
          </select>
        </div>

        <div class="col-12 col-sm-6">
          <label class="form-label" for="newTaskDueDate">Due date</label>
          <input
            id="newTaskDueDate"
            class="form-control"
            type="date"
            formControlName="dueDate"
          />
        </div>
      </div>

      @if (categoryErrorMessage()) {
        <div class="alert alert-warning d-flex justify-content-between align-items-center mt-3" role="status">
          <span>{{ categoryErrorMessage() }}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="loadCategories()">
            Retry categories
          </button>
        </div>
      }

      @if (errorMessage()) {
        <p class="alert alert-danger mt-3" role="alert">{{ errorMessage() }}</p>
      }

      <div class="actions d-flex justify-content-end gap-2 mt-4">
        <a class="btn btn-outline-secondary" routerLink="/tasks">Cancel</a>
        <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Creating...' : 'Create task' }}
        </button>
      </div>
    </form>
  `,
  styleUrl: './new-task-page.component.scss'
})
export class NewTaskPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryErrorMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoadingCategories = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    categoryId: [''],
    dueDate: ['']
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
      dueAt: toDueAtIsoString(formValue.dueDate)
    };
  }

  protected loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryErrorMessage.set('');

    this.categoriesService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoadingCategories.set(false);
        },
        error: (error) => {
          this.categories.set([]);
          this.categoryErrorMessage.set(
            this.categoriesService.getErrorMessage(
              error,
              'Categories could not load. You can still create the task without a category.'
            )
          );
          this.isLoadingCategories.set(false);
        }
      });
  }
}
