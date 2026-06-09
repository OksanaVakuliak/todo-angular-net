import { Component, HostListener, input, output } from '@angular/core';

let nextDialogId = 0;

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="dialog-backdrop" role="presentation" (click)="cancel()">
        <div
          class="dialog-panel modal-content"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h2 class="modal-title h5 m-0" [id]="titleId">{{ title() }}</h2>
          </div>

          <div class="modal-body">
            <p class="m-0" [id]="messageId">{{ message() }}</p>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              [disabled]="isBusy()"
              (click)="cancel()"
            >
              {{ cancelLabel() }}
            </button>
            <button type="button" class="btn btn-danger" [disabled]="isBusy()" (click)="confirm()">
              {{ isBusy() ? busyLabel() : confirmLabel() }}
            </button>
          </div>
        </div>
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
