import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from './api-error.utils';

describe('getApiErrorMessage', () => {
  it('returns backend error messages', () => {
    const error = new HttpErrorResponse({
      error: { code: 'task_not_found', message: ' Task was not found. ' },
      status: 404
    });

    expect(getApiErrorMessage(error, 'Fallback message.')).toBe('Task was not found.');
  });

  it('returns the first validation error message', () => {
    const error = new HttpErrorResponse({
      error: {
        code: 'validation_failed',
        message: '',
        errors: {
          title: [' Title is required. '],
          dueAt: ['Due date is invalid.']
        }
      },
      status: 400
    });

    expect(getApiErrorMessage(error, 'Fallback message.')).toBe('Title is required.');
  });

  it('falls back when the response has no useful message', () => {
    const error = new HttpErrorResponse({
      error: {},
      status: 500
    });

    expect(getApiErrorMessage(error, 'Fallback message.')).toBe('Fallback message.');
  });
});
