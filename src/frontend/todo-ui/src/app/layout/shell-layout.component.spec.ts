import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellLayoutComponent } from './shell-layout.component';

describe('ShellLayoutComponent', () => {
  let fixture: ComponentFixture<ShellLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent],
      providers: [provideRouter([])]
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
      { href: '/categories', text: 'Categories' }
    ]);
  });

  it('keeps sign in outside the primary navigation', () => {
    const element = fixture.nativeElement as HTMLElement;
    const accountLink = element.querySelector<HTMLAnchorElement>('.account-link');

    expect(accountLink?.getAttribute('href')).toBe('/login');
    expect(accountLink?.textContent?.trim()).toBe('Sign in');
  });
});
