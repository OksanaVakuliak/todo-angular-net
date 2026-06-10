import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from '../../categories/category.models';
import { CategoriesService } from '../../categories/categories.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { TaskItem, UpdateTaskRequest } from '../task.models';
import { toDateInputValue, toDueAtIsoString } from '../task-date.utils';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [PageIntroComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="Edit task"
      description="Update the task details, category, due date, or completion state."
    />

    @if (loadErrorMessage()) {
      <div class="task-form card">
        <p class="alert alert-danger">{{ loadErrorMessage() }}</p>
        <div class="actions d-flex justify-content-end">
          <a class="btn btn-outline-secondary" routerLink="/tasks">Back to tasks</a>
        </div>
      </div>
    } @else if (isLoading()) {
      <div class="task-form card">
        <p class="loading-message text-secondary m-0">Loading task...</p>
      </div>
    } @else {
      <form class="task-form card" [formGroup]="taskForm" (ngSubmit)="updateTask()">
        <div class="mb-3">
          <label class="form-label" for="editTaskTitle">Title</label>
          <input
            id="editTaskTitle"
            class="form-control"
            type="text"
            formControlName="title"
            maxlength="200"
            placeholder="Task title"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label" for="editTaskDescription">Description</label>
          <textarea
            id="editTaskDescription"
            class="form-control"
            rows="5"
            formControlName="description"
            maxlength="2000"
            placeholder="Add details"
          ></textarea>
        </div>

        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label class="form-label" for="editTaskCategory">Category</label>
            <select
              id="editTaskCategory"
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
            <label class="form-label" for="editTaskDueDate">Due date</label>
            <input
              id="editTaskDueDate"
              class="form-control"
              type="date"
              formControlName="dueDate"
            />
          </div>
        </div>

        <div class="form-check mt-3">
          <input
            id="editTaskCompleted"
            class="form-check-input"
            type="checkbox"
            formControlName="isCompleted"
          />
          <label class="form-check-label" for="editTaskCompleted">Completed</label>
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
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="taskForm.invalid || isSubmitting() || isLoading()"
          >
            {{ isSubmitting() ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    }
  `,
  styleUrl: './new-task-page.component.scss'
})
export class EditTaskPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  private readonly taskId = this.route.snapshot.paramMap.get('taskId') ?? '';

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryErrorMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoadingCategories = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly loadErrorMessage = signal('');

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    categoryId: [''],
    dueDate: [''],
    isCompleted: [false]
  });

  constructor() {
    this.loadCategories();
    this.loadTask();
  }

  protected updateTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.tasksService
      .updateTask(this.taskId, this.buildUpdateRequest())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/tasks'),
        error: (error) => {
          this.errorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to save task changes.')
          );
          this.isSubmitting.set(false);
        }
      });
  }

  private buildUpdateRequest(): UpdateTaskRequest {
    const formValue = this.taskForm.getRawValue();

    return {
      categoryId: formValue.categoryId || null,
      title: formValue.title.trim(),
      description: formValue.description.trim() || null,
      dueAt: toDueAtIsoString(formValue.dueDate),
      isCompleted: formValue.isCompleted
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
              'Categories could not load. You can still save the task without changing its category.'
            )
          );
          this.isLoadingCategories.set(false);
        }
      });
  }

  private loadTask(): void {
    this.isLoading.set(true);

    this.tasksService
      .getTask(this.taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.patchForm(task);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.loadErrorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to load this task.')
          );
          this.isLoading.set(false);
        }
      });
  }

  private patchForm(task: TaskItem): void {
    this.taskForm.setValue({
      title: task.title,
      description: task.description ?? '',
      categoryId: task.categoryId ?? '',
      dueDate: toDateInputValue(task.dueAt ?? null),
      isCompleted: task.isCompleted
    });
  }
}
