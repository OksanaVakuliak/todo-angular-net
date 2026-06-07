import { Component, HostListener, input, output } from '@angular/core';

let nextDialogId = 0;

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="dialog-backdrop" role="presentation" (click)="cancel()">
        <section
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          (click)="$event.stopPropagation()"
        >
          <div class="dialog-icon" aria-hidden="true">!</div>

          <div class="dialog-content">
            <h2 [id]="titleId">{{ title() }}</h2>
            <p [id]="messageId">{{ message() }}</p>
          </div>

          <div class="dialog-actions">
            <button type="button" class="secondary-button" [disabled]="isBusy()" (click)="cancel()">
              {{ cancelLabel() }}
            </button>
            <button type="button" class="danger-button" [disabled]="isBusy()" (click)="confirm()">
              {{ isBusy() ? busyLabel() : confirmLabel() }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  private readonly dialogId = nextDialogId++;

  protected readonly titleId = `confirmation-dialog-title-${this.dialogId}`;
  protected readonly messageId = `confirmation-dialog-message-${this.dialogId}`;

  readonly isBusy = input(false);
  readonly isOpen = input(false);
  readonly busyLabel = input('Working...');
  readonly cancelLabel = input('Cancel');
  readonly confirmLabel = input('Confirm');
  readonly message = input.required<string>();
  readonly title = input.required<string>();

  readonly cancelled = output<void>();
  readonly confirmed = output<void>();

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.isOpen()) {
      this.cancel();
    }
  }

  protected cancel(): void {
    if (this.isBusy()) {
      return;
    }

    this.cancelled.emit();
  }

  protected confirm(): void {
    if (this.isBusy()) {
      return;
    }

    this.confirmed.emit();
  }
}
