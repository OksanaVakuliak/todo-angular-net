import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from '../../categories/category.models';
import { CategoriesService } from '../../categories/categories.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { TaskItem, UpdateTaskRequest } from '../task.models';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageIntroComponent,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="Edit task"
      description="Update the task details, category, due date, or completion state."
    />

    @if (loadErrorMessage()) {
      <div class="task-form">
        <p class="form-alert">{{ loadErrorMessage() }}</p>
        <div class="actions">
          <a routerLink="/tasks">Back to tasks</a>
        </div>
      </div>
    } @else if (isLoading()) {
      <div class="task-form">
        <p class="loading-message">Loading task...</p>
      </div>
    } @else {
      <form class="task-form" [formGroup]="taskForm" (ngSubmit)="updateTask()">
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
          <mat-form-field class="app-material-field">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option value="">No category</mat-option>
              @for (category of categories(); track category.id) {
                <mat-option [value]="category.id">{{ category.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="app-material-field">
            <mat-label>Due date</mat-label>
            <input matInput [matDatepicker]="dueDatePicker" formControlName="dueDate" readonly />
            <mat-datepicker-toggle matIconSuffix [for]="dueDatePicker" />
            <mat-datepicker #dueDatePicker />
          </mat-form-field>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" formControlName="isCompleted" />
          Completed
        </label>

        @if (errorMessage()) {
          <p class="form-alert">{{ errorMessage() }}</p>
        }

        <div class="actions">
          <a routerLink="/tasks">Cancel</a>
          <button type="submit" [disabled]="taskForm.invalid || isSubmitting() || isLoading()">
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
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly loadErrorMessage = signal('');

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    categoryId: [''],
    dueDate: this.formBuilder.control<Date | null>(null),
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
      dueAt: this.toDueAtIsoString(formValue.dueDate),
      isCompleted: formValue.isCompleted
    };
  }

  private loadCategories(): void {
    this.categoriesService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: () => this.categories.set([])
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
    const dueDateTime = task.dueAt ? new Date(task.dueAt) : null;

    this.taskForm.setValue({
      title: task.title,
      description: task.description ?? '',
      categoryId: task.categoryId ?? '',
      dueDate: dueDateTime ? this.toDateControlValue(dueDateTime) : null,
      isCompleted: task.isCompleted
    });
  }

  private toDueAtIsoString(dueDate: Date | null): string | null {
    if (!dueDate) {
      return null;
    }

    const date = new Date(dueDate);
    date.setHours(0, 0, 0, 0);

    return date.toISOString();
  }

  private toDateControlValue(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
