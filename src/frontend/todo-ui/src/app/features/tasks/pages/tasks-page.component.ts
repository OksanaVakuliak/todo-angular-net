import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category } from '../../categories/category.models';
import { CategoriesService } from '../../categories/categories.service';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { PagedResult, TaskItem } from '../task.models';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, PageIntroComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="Tasks"
      description="Plan, track, and keep your task list moving."
    />

    <section class="task-panel" aria-labelledby="task-filters-title">
      <div class="panel-header">
        <div>
          <h2 id="task-filters-title">Task list</h2>
          <p>{{ taskSummary() }}</p>
        </div>

        <button type="button" class="ghost-button" (click)="loadTasks()">Refresh</button>
      </div>

      <form class="filters" [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
        <label>
          Search
          <input type="search" formControlName="search" placeholder="Search by title" />
        </label>

        <label>
          Category
          <select formControlName="categoryId">
            <option value="">All categories</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </label>

        <div class="filter-actions">
          <button type="button" class="ghost-button" (click)="clearFilters()">Clear</button>
          <button type="submit" class="primary-button">Apply</button>
        </div>
      </form>

      @if (errorMessage()) {
        <p class="alert error">{{ errorMessage() }}</p>
      }

      @if (isLoading()) {
        <p class="muted">Loading tasks...</p>
      } @else if (tasksResult().items.length === 0) {
        <div class="empty-state">
          <h3>No tasks yet</h3>
          <p>Create your first task from the New Task page or adjust the filters.</p>
        </div>
      } @else {
        <ul class="task-list">
          @for (task of tasksResult().items; track task.id) {
            <li class="task-item" [class.completed]="task.isCompleted">
              <div class="task-main">
                <label class="completion-toggle">
                  <input
                    type="checkbox"
                    [checked]="task.isCompleted"
                    [disabled]="updatingTaskId() === task.id"
                    (change)="toggleTaskCompletion(task)"
                  />
                  <span>{{ task.isCompleted ? 'Completed' : 'Open' }}</span>
                </label>

                <h3>{{ task.title }}</h3>

                @if (task.description) {
                  <p class="description">{{ task.description }}</p>
                }

                <div class="meta">
                  <span>{{ task.categoryName ?? 'No category' }}</span>
                  @if (task.dueAt) {
                    <span>Due {{ task.dueAt | date: 'mediumDate' }}</span>
                  }
                </div>
              </div>

              <div class="task-actions">
                <a [routerLink]="['/tasks', task.id, 'edit']">Edit</a>
                <button
                  type="button"
                  class="danger-button"
                  [disabled]="deletingTaskId() === task.id"
                  (click)="deleteTask(task)"
                >
                  Delete
                </button>
              </div>
            </li>
          }
        </ul>
      }

      <div class="pagination" aria-label="Task pagination">
        <button
          type="button"
          class="ghost-button"
          [disabled]="currentPage() <= 1 || isLoading()"
          (click)="goToPage(currentPage() - 1)"
        >
          Previous
        </button>

        <span>Page {{ currentPage() }} of {{ totalPages() }}</span>

        <button
          type="button"
          class="ghost-button"
          [disabled]="currentPage() >= totalPages() || isLoading()"
          (click)="goToPage(currentPage() + 1)"
        >
          Next
        </button>
      </div>
    </section>
  `,
  styleUrl: './tasks-page.component.scss'
})
export class TasksPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly pageSize = 10;
  private latestLoadId = 0;

  protected readonly categories = signal<Category[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly deletingTaskId = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);
  protected readonly updatingTaskId = signal<string | null>(null);
  protected readonly tasksResult = signal<PagedResult<TaskItem>>({
    items: [],
    page: 1,
    limit: this.pageSize,
    totalItems: 0,
    totalPages: 1
  });

  protected readonly filtersForm = this.formBuilder.nonNullable.group({
    search: [''],
    categoryId: ['']
  });

  constructor() {
    this.loadCategories();
    this.loadTasks();
  }

  protected applyFilters(): void {
    this.currentPage.set(1);
    this.loadTasks();
  }

  protected clearFilters(): void {
    this.filtersForm.reset({
      search: '',
      categoryId: ''
    });
    this.applyFilters();
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }

  protected toggleTaskCompletion(task: TaskItem): void {
    this.updatingTaskId.set(task.id);
    this.errorMessage.set('');

    this.tasksService
      .updateTask(task.id, {
        isCompleted: !task.isCompleted
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedTask) => {
          this.tasksResult.update((result) => ({
            ...result,
            items: result.items.map((item) => (item.id === updatedTask.id ? updatedTask : item))
          }));
          this.updatingTaskId.set(null);
        },
        error: (error) => {
          this.errorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to update the task status.')
          );
          this.updatingTaskId.set(null);
        }
      });
  }

  protected deleteTask(task: TaskItem): void {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingTaskId.set(task.id);
    this.errorMessage.set('');

    this.tasksService
      .deleteTask(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingTaskId.set(null);
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to delete the task.')
          );
          this.deletingTaskId.set(null);
        }
      });
  }

  protected loadTasks(): void {
    const filters = this.filtersForm.getRawValue();
    const loadId = this.latestLoadId + 1;

    this.latestLoadId = loadId;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.tasksService
      .listTasks({
        page: this.currentPage(),
        limit: this.pageSize,
        search: filters.search,
        categoryId: filters.categoryId || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (loadId !== this.latestLoadId) {
            return;
          }

          this.tasksResult.set({
            ...result,
            totalPages: Math.max(result.totalPages, 1)
          });
          this.currentPage.set(result.page);
          this.isLoading.set(false);
        },
        error: (error) => {
          if (loadId !== this.latestLoadId) {
            return;
          }

          this.errorMessage.set(
            this.tasksService.getErrorMessage(error, 'Unable to load tasks.')
          );
          this.isLoading.set(false);
        }
      });
  }

  protected taskSummary(): string {
    const result = this.tasksResult();

    return result.totalItems === 1 ? '1 task found' : `${result.totalItems} tasks found`;
  }

  protected totalPages(): number {
    return Math.max(this.tasksResult().totalPages, 1);
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
}
