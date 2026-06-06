import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { PageIntroComponent } from '../../../shared/ui/page-intro.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [PageIntroComponent],
  template: `
    <app-page-intro
      eyebrow="Tasks"
      title="Tasks"
      description="Main workspace route for the task list, filters, pagination, and task actions."
    />

    <section class="stack-status" aria-labelledby="stack-status-title">
      <h2 id="stack-status-title">Local stack status</h2>
      <p>{{ healthStatus().message }}</p>
    </section>
  `,
  styles: [
    `
    .stack-status {
      margin-top: 1.5rem;
      padding: 1rem 1.25rem;
      border: 1px solid rgba(37, 99, 235, 0.15);
      border-radius: 0.5rem;
      background: #ffffff;
      color: #0f172a;
    }

    .stack-status h2 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }

    .stack-status p {
      margin: 0;
      line-height: 1.5;
    }
  `
  ]
})
export class TasksPageComponent {
  private readonly httpClient = inject(HttpClient);

  protected readonly healthStatus = toSignal(
    this.httpClient.get<{ status: string; service: string }>('/api/health').pipe(
      map((response) => ({
        message: `Frontend is connected to ${response.service}. API status: ${response.status}.`
      })),
      catchError(() =>
        of({
          message: 'Frontend is running, but the API health endpoint is not reachable yet.'
        })
      ),
      startWith({
        message: 'Checking backend connectivity...'
      })
    ),
    {
      initialValue: {
        message: 'Checking backend connectivity...'
      }
    }
  );
}
