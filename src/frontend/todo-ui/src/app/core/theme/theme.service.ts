import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

export interface ThemeOption {
  label: string;
  value: AppTheme;
}

const storageKey = 'todo-ui-theme';
const defaultTheme: AppTheme = 'light';
const themes: ThemeOption[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly selectedTheme = signal<AppTheme>(this.getInitialTheme());

  readonly currentTheme = this.selectedTheme.asReadonly();
  readonly themes = themes;

  constructor() {
    this.applyTheme(this.selectedTheme());
  }

  setTheme(theme: AppTheme): void {
    this.selectedTheme.set(theme);
    this.applyTheme(theme);
    this.document.defaultView?.localStorage.setItem(storageKey, theme);
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.dataset['theme'] = theme;
  }

  private getInitialTheme(): AppTheme {
    const storedTheme = this.document.defaultView?.localStorage.getItem(storageKey) ?? null;

    return this.isAppTheme(storedTheme) ? storedTheme : defaultTheme;
  }

  private isAppTheme(value: string | null): value is AppTheme {
    return themes.some((theme) => theme.value === value);
  }
}
