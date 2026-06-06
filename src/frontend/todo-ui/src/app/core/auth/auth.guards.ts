import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateChildFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadSession().pipe(
    map((user) =>
      user
        ? true
        : router.createUrlTree(['/login'], {
            queryParams: {
              returnUrl: state.url
            }
          })
    )
  );
};

export const publicOnlyGuard: CanActivateChildFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadSession().pipe(map((user) => (user ? router.createUrlTree(['/tasks']) : true)));
};

