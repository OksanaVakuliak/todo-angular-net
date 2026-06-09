import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  message?: unknown;
  errors?: unknown;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error as ApiErrorBody | string | null | undefined;

  if (typeof body === 'string') {
    const message = body.trim();

    if (message.length > 0) {
      return message;
    }
  }

  if (!body || typeof body !== 'object') {
    return fallback;
  }

  if (typeof body.message === 'string') {
    const message = body.message.trim();

    if (message.length > 0) {
      return message;
    }
  }

  const validationMessage = getValidationErrorMessage(body.errors);

  return validationMessage ?? fallback;
}

function getValidationErrorMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const messages = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return messages.length > 0 ? messages[0].trim() : null;
}
