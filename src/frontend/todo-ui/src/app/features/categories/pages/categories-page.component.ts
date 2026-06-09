import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog.component';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../category.models';
import { CategoriesService } from '../categories.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [ConfirmationDialogComponent, PageIntroComponent, ReactiveFormsModule],
  template: `
    <app-page-intro
      eyebrow="Categories"
      title="Categories"
      description="Create, edit, and remove categories for your task list."
    />

    <section class="categories-layout" aria-label="Category management">
      <form class="category-form" [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
        <div class="form-heading">
          <h2>{{ editingCategoryId() ? 'Edit category' : 'New category' }}</h2>
          @if (editingCategoryId()) {
            <button type="button" class="link-button" (click)="cancelEdit()">Cancel edit</button>
          }
        </div>

        <label>
          Name
          <input
            type="text"
            formControlName="name"
            maxlength="100"
            placeholder="Category name"
            required
          />
        </label>

        <label>
          Color
          <input type="color" formControlName="color" />
        </label>

        @if (formErrorMessage()) {
          <p class="form-alert">{{ formErrorMessage() }}</p>
        }

        <button type="submit" [disabled]="categoryForm.invalid || isSaving()">
          {{ saveButtonText() }}
        </button>
      </form>

      <section class="category-panel" aria-labelledby="categories-list-title">
        <div class="panel-header">
          <div>
            <h2 id="categories-list-title">Category list</h2>
            <p>{{ categorySummary() }}</p>
          </div>

          <button
            type="button"
            class="ghost-button"
            [disabled]="isLoading()"
            (click)="loadCategories()"
          >
            {{ isLoading() ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        @if (showInlineRefreshMessage()) {
          <p class="muted status-message" role="status">Refreshing categories...</p>
        }

        @if (showInitialLoading()) {
          <div class="loading-state" role="status" aria-live="polite">
            <span class="loading-dot"></span>
            <p>Loading categories...</p>
          </div>
        } @else if (showLoadErrorState()) {
          <div class="empty-state error-state">
            <h3>Categories could not load</h3>
            <p>{{ listErrorMessage() }}</p>
            <button type="button" class="ghost-button" (click)="loadCategories()">Try again</button>
          </div>
        } @else if (categories().length === 0) {
          <div class="empty-state">
            <h3>No categories yet</h3>
            <p>Add your first category to start grouping tasks.</p>
          </div>
        } @else {
          <ul class="category-list">
            @for (category of categories(); track category.id) {
              <li class="category-item">
                <div class="category-main">
                  <input
                    class="category-color"
                    type="color"
                    [value]="category.color ?? fallbackColor"
                    disabled
                    aria-label="Category color"
                  />
                  <div>
                    <h3>{{ category.name }}</h3>
                    <p>{{ category.color ?? 'No color set' }}</p>
                  </div>
                </div>

                <div class="category-actions">
                  <button
                    type="button"
                    class="ghost-button"
                    [disabled]="isSaving() || deletingCategoryId() === category.id"
                    (click)="startEdit(category)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="danger-button"
                    [disabled]="deletingCategoryId() === category.id"
                    (click)="requestCategoryDelete(category)"
                  >
                    {{ deletingCategoryId() === category.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      </section>
    </section>

    <app-confirmation-dialog
      [isOpen]="categoryPendingDelete() !== null"
      [isBusy]="deletingCategoryId() === categoryPendingDelete()?.id"
      title="Delete category?"
      [message]="deleteCategoryMessage()"
      confirmLabel="Delete category"
      busyLabel="Deleting..."
      (cancelled)="cancelCategoryDelete()"
      (confirmed)="confirmCategoryDelete()"
    />
  `,
  styleUrl: './categories-page.component.scss'
})
export class CategoriesPageComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly fallbackColor = '#8cc0eb';
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryPendingDelete = signal<Category | null>(null);
  protected readonly deletingCategoryId = signal<string | null>(null);
  protected readonly editingCategoryId = signal<string | null>(null);
  protected readonly formErrorMessage = signal('');
  protected readonly hasLoadedCategories = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly listErrorMessage = signal('');

  protected readonly categoryForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(100)
    ]),
    color: this.formBuilder.control<string | null>(null)
  });

  constructor() {
    this.loadCategories();
  }

  protected cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.formErrorMessage.set('');
    this.categoryForm.reset({
      name: '',
      color: null
    });
  }

  protected categorySummary(): string {
    const count = this.categories().length;

    return count === 1 ? '1 category available' : `${count} categories available`;
  }

  protected cancelCategoryDelete(): void {
    this.categoryPendingDelete.set(null);
  }

  protected confirmCategoryDelete(): void {
    const category = this.categoryPendingDelete();

    if (!category) {
      return;
    }

    this.deletingCategoryId.set(category.id);
    this.listErrorMessage.set('');

    this.categoriesService
      .deleteCategory(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingCategoryId.set(null);
          this.categoryPendingDelete.set(null);
          if (this.editingCategoryId() === category.id) {
            this.cancelEdit();
          }
          this.loadCategories();
        },
        error: (error) => {
          this.listErrorMessage.set(
            this.categoriesService.getErrorMessage(error, 'Unable to delete the category.')
          );
          this.deletingCategoryId.set(null);
        }
      });
  }

  protected deleteCategoryMessage(): string {
    const category = this.categoryPendingDelete();

    return category
      ? `This will delete "${category.name}". Tasks assigned to it will move to No category.`
      : '';
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.listErrorMessage.set('');

    this.categoriesService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.hasLoadedCategories.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.listErrorMessage.set(
            this.categoriesService.getErrorMessage(error, 'Unable to load categories.')
          );
          this.hasLoadedCategories.set(true);
          this.isLoading.set(false);
        }
      });
  }

  protected saveButtonText(): string {
    if (this.isSaving()) {
      return this.editingCategoryId() ? 'Saving...' : 'Creating...';
    }

    return this.editingCategoryId() ? 'Save changes' : 'Create category';
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const editingId = this.editingCategoryId();

    this.isSaving.set(true);
    this.formErrorMessage.set('');

    const request = editingId
      ? this.categoriesService.updateCategory(editingId, this.buildUpdateRequest())
      : this.categoriesService.createCategory(this.buildCreateRequest());

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (category) => {
        this.categories.update((categories) =>
          editingId
            ? categories.map((item) => (item.id === category.id ? category : item))
            : [...categories, category].sort((first, second) => first.name.localeCompare(second.name))
        );
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: (error) => {
        this.formErrorMessage.set(
          this.categoriesService.getErrorMessage(error, 'Unable to save the category.')
        );
        this.isSaving.set(false);
      }
    });
  }

  protected requestCategoryDelete(category: Category): void {
    this.categoryPendingDelete.set(category);
  }

  protected startEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.formErrorMessage.set('');
    this.categoryForm.setValue({
      name: category.name,
      color: category.color
    });
    this.categoryForm.markAsPristine();
  }

  protected showInitialLoading(): boolean {
    return this.isLoading() && !this.hasLoadedCategories() && this.categories().length === 0;
  }

  protected showInlineRefreshMessage(): boolean {
    return this.isLoading() && this.hasLoadedCategories() && this.categories().length > 0;
  }

  protected showLoadErrorState(): boolean {
    return !this.isLoading() && this.listErrorMessage().length > 0 && this.categories().length === 0;
  }

  private buildCreateRequest(): CreateCategoryRequest {
    const formValue = this.categoryForm.getRawValue();

    return {
      name: formValue.name.trim(),
      color: formValue.color || null
    };
  }

  private buildUpdateRequest(): UpdateCategoryRequest {
    const formValue = this.categoryForm.getRawValue();
    const request: UpdateCategoryRequest = {
      name: formValue.name.trim()
    };

    if (this.categoryForm.controls.color.dirty) {
      request.color = formValue.color || null;
    }

    return request;
  }
}
