import { Component, inject } from '@angular/core';
import { AppTheme, ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <div class="theme-switcher" aria-label="Theme">
      @for (theme of themeService.themes; track theme.value) {
        <button
          type="button"
          class="theme-option"
          [class.active]="themeService.currentTheme() === theme.value"
          [attr.aria-pressed]="themeService.currentTheme() === theme.value"
          (click)="changeTheme(theme.value)"
        >
          <span class="swatch" [class]="'swatch ' + theme.value" aria-hidden="true"></span>
          <span>{{ theme.label }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);

  protected changeTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
