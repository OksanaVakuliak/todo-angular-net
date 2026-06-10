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
        path: '',
        pathMatch: 'full',
        title: 'Todo App — organize your tasks',
        loadComponent: () =>
          import('./features/home/home-page.component').then((module) => module.HomePageComponent)
      },
      {
        path: 'login',
        title: 'Sign in — Todo App',
        loadComponent: () =>
          import('./features/auth/pages/login-page.component').then(
            (module) => module.LoginPageComponent
          )
      },
      {
        path: 'register',
        title: 'Create account — Todo App',
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
        title: 'Tasks — Todo App',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-page.component').then(
            (module) => module.TasksPageComponent
          )
      },
      {
        path: 'tasks/new',
        title: 'New task — Todo App',
        loadComponent: () =>
          import('./features/tasks/pages/new-task-page.component').then(
            (module) => module.NewTaskPageComponent
          )
      },
      {
        path: 'tasks/:taskId/edit',
        title: 'Edit task — Todo App',
        loadComponent: () =>
          import('./features/tasks/pages/edit-task-page.component').then(
            (module) => module.EditTaskPageComponent
          )
      },
      {
        path: 'categories',
        title: 'Categories — Todo App',
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
