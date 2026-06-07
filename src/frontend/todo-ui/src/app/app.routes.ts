import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth/auth.guards';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { ShellLayoutComponent } from './layout/shell-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivateChild: [publicOnlyGuard],
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
    canActivateChild: [authGuard],
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
      },
      {
        path: 'tasks/:taskId/edit',
        loadComponent: () =>
          import('./features/tasks/pages/edit-task-page.component').then(
            (module) => module.EditTaskPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
