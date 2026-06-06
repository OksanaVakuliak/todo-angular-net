import { routes } from './app.routes';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { ShellLayoutComponent } from './layout/shell-layout.component';

describe('routes', () => {
  it('registers login under the unauthenticated layout', () => {
    const authRoute = routes.find((route) => route.component === AuthLayoutComponent);
    const loginRoute = authRoute?.children?.find((route) => route.path === 'login');

    expect(loginRoute).toBeDefined();
    expect(loginRoute?.loadComponent).toEqual(jasmine.any(Function));
  });

  it('registers tasks and categories under the authenticated shell layout', () => {
    const shellRoute = routes.find((route) => route.component === ShellLayoutComponent);
    const childPaths = shellRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain('');
    expect(childPaths).toContain('tasks');
    expect(childPaths).toContain('categories');
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
