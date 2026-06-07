import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss'
})
export class ShellLayoutComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login')
    });
  }
}
