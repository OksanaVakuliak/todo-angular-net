import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { ShellLayoutComponent } from './layout/shell-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-page.component').then(
            (module) => module.LoginPageComponent
          )
      }
    ]
  },
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks'
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-page.component').then(
            (module) => module.TasksPageComponent
          )
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/pages/categories-page.component').then(
            (module) => module.CategoriesPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
