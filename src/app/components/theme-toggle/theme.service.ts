import { Injectable, Inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private media: MediaQueryList | null = null;
  private listener: ((e: MediaQueryListEvent) => void) | null = null;

  // current selection the user made
  current = signal<Theme>('system');

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    // initialize from storage or system on construct
    const stored = this.getStoredTheme();
    this.current.set(stored);
    this.applyTheme(stored);

    // keep DOM class in sync if current changes (e.g., from UI)
    effect(() => {
      this.applyTheme(this.current());
    });
  }

  set(theme: Theme) {
    this.current.set(theme);
    this.storeTheme(theme);
  }

  // -------- internals --------
  private applyTheme(theme: Theme) {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = this.doc.documentElement; // <html>

    // remove both then add the one we want (your CSS uses .light / .dark)
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const prefersDark = this.getSystemPrefersDark();
      root.classList.add(prefersDark ? 'dark' : 'light');
      this.bindSystemListener(); // react to OS changes
    } else {
      root.classList.add(theme);
      this.unbindSystemListener();
    }
  }

  private getStoredTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) return 'system';
    const raw = localStorage.getItem('theme') as Theme | null;
    return raw ?? 'system';
  }

  private storeTheme(theme: Theme) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('theme', theme);
  }

  private getSystemPrefersDark(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    this.media ??= window.matchMedia('(prefers-color-scheme: dark)');
    return this.media.matches;
  }

  private bindSystemListener() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.media)
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
    if (this.listener) return;

    this.listener = (e) => {
      const root = this.doc.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    this.media.addEventListener('change', this.listener);
  }

  private unbindSystemListener() {
    if (this.media && this.listener) {
      this.media.removeEventListener('change', this.listener);
      this.listener = null;
    }
  }
}
