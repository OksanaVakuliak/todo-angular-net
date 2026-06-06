import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ShellLayoutComponent } from './shell-layout.component';

describe('ShellLayoutComponent', () => {
  let fixture: ComponentFixture<ShellLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShellLayoutComponent);
    fixture.detectChanges();
  });

  it('renders primary navigation links', () => {
    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('nav a')
    ).map((link) => ({
      href: link.getAttribute('href'),
      text: link.textContent?.trim()
    }));

    expect(links).toEqual([
      { href: '/tasks', text: 'Tasks' },
      { href: '/tasks/new', text: 'New Task' }
    ]);
  });

  it('keeps account actions outside the primary navigation', () => {
    const element = fixture.nativeElement as HTMLElement;
    const accountButton = element.querySelector<HTMLButtonElement>('.account-actions button');

    expect(accountButton?.textContent?.trim()).toBe('Sign out');
  });
});
