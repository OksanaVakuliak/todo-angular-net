import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
        <mat-form-field class="app-material-field">
          <mat-label>Category</mat-label>
          <mat-select formControlName="categoryId" [disabled]="isLoadingCategories()">
            @if (isLoadingCategories()) {
              <mat-option value="">Loading categories...</mat-option>
            } @else {
              <mat-option value="">No category</mat-option>
              @for (category of categories(); track category.id) {
                <mat-option [value]="category.id">{{ category.name }}</mat-option>
              }
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

      @if (categoryErrorMessage()) {
        <div class="form-notice error-notice">
          <p>{{ categoryErrorMessage() }}</p>
          <button type="button" class="secondary-action" (click)="loadCategories()">
            Retry categories
          </button>
        </div>
      }

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
    dueDate: this.formBuilder.control<Date | null>(null)
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
