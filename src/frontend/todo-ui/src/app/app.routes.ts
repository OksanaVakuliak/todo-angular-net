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
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register-page.component').then(
            (module) => module.RegisterPageComponent
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
        path: 'tasks/new',
        loadComponent: () =>
          import('./features/tasks/pages/new-task-page.component').then(
            (module) => module.NewTaskPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
