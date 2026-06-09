import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="home-page" aria-labelledby="home-title">
      <div class="row g-4 align-items-center">
        <div class="home-copy col-12 col-lg-7">
          <p class="eyebrow">Task planning, without the noise</p>
          <h1 id="home-title" class="mb-3">Keep daily work clear, visible, and easy to finish.</h1>
          <p class="lead">
            To-Do App helps you capture tasks, group them by category, find the right item quickly,
            and keep your list moving without losing context.
          </p>

          <div class="home-actions d-flex flex-wrap gap-2 mt-2">
            <a class="btn btn-primary btn-lg" routerLink="/register">Create account</a>
            <a class="btn btn-outline-secondary btn-lg" routerLink="/login">Sign in</a>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="home-preview card" aria-label="App preview">
            <div class="card-body">
              <div class="preview-header d-flex justify-content-between align-items-center">
                <span>Today</span>
                <strong>4 tasks</strong>
              </div>

              <ul class="preview-list list-unstyled">
                <li>
                  <span class="status-dot active"></span>
                  <div>
                    <strong>Plan the next sprint</strong>
                    <span>Work · Due today</span>
                  </div>
                </li>
                <li>
                  <span class="status-dot"></span>
                  <div>
                    <strong>Update shopping list</strong>
                    <span>Personal · No rush</span>
                  </div>
                </li>
                <li>
                  <span class="status-dot done"></span>
                  <div>
                    <strong>Review completed tasks</strong>
                    <span>Done · Archived in place</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="home-details row g-3 mt-1" aria-label="What you can do">
        <div class="col-12 col-md-4">
          <article class="card h-100">
            <div class="card-body">
              <h2>Organize by category</h2>
              <p>Give every task a context and color so priorities are easier to scan.</p>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="card h-100">
            <div class="card-body">
              <h2>Search and filter</h2>
              <p>Use title search and category filters to get back to the right task faster.</p>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="card h-100">
            <div class="card-body">
              <h2>Choose your theme</h2>
              <p>Switch between light and dark modes while keeping the interface consistent.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {}
