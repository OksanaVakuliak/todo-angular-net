import { routes } from './app.routes';
import { authGuard, publicOnlyGuard } from './core/auth/auth.guards';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { ShellLayoutComponent } from './layout/shell-layout.component';

describe('routes', () => {
  it('registers login and register under the unauthenticated layout', () => {
    const authRoute = routes.find((route) => route.component === AuthLayoutComponent);
    const homeRoute = authRoute?.children?.find((route) => route.path === '');
    const loginRoute = authRoute?.children?.find((route) => route.path === 'login');
    const registerRoute = authRoute?.children?.find((route) => route.path === 'register');

    expect(homeRoute).toBeDefined();
    expect(homeRoute?.pathMatch).toBe('full');
    expect(homeRoute?.loadComponent).toEqual(jasmine.any(Function));
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.loadComponent).toEqual(jasmine.any(Function));
    expect(registerRoute).toBeDefined();
    expect(registerRoute?.loadComponent).toEqual(jasmine.any(Function));
    expect(authRoute?.canActivateChild).toEqual([publicOnlyGuard]);
  });

  it('registers tasks and categories under the application shell layout', () => {
    const shellRoute = routes.find((route) => route.component === ShellLayoutComponent);
    const childPaths = shellRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain('');
    expect(childPaths).toContain('tasks');
    expect(childPaths).toContain('tasks/new');
    expect(childPaths).toContain('tasks/:taskId/edit');
    expect(childPaths).toContain('categories');
    expect(shellRoute?.canActivateChild).toEqual([authGuard]);
  });

  it('redirects empty and unknown routes to tasks', () => {
    const shellRoute = routes.find((route) => route.component === ShellLayoutComponent);
    const emptyRoute = shellRoute?.children?.find((route) => route.path === '');
    const fallbackRoute = routes.find((route) => route.path === '**');

    expect(emptyRoute?.redirectTo).toBe('tasks');
    expect(emptyRoute?.pathMatch).toBe('full');
    expect(fallbackRoute?.redirectTo).toBe('tasks');
  });
});
