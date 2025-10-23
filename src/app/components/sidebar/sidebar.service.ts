import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const KEY = 'sidebar:collapsed';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly isBrowser: boolean;

  /** desktop: true = collapsed (icon rail), false = expanded */
  readonly collapsed = signal<boolean>(false);

  /** mobile top-sheet visibility */
  readonly mobileOpen = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.collapsed.set(this.read());
      effect(() => localStorage.setItem(KEY, JSON.stringify(this.collapsed())));

      // lock body scroll while the sheet is open
      effect(() => {
        const on = this.mobileOpen();
        document.body.classList.toggle('overflow-hidden', on);
      });
    }
  }

  toggle() {
    this.collapsed.update((v) => !v);
  }
  set(v: boolean) {
    this.collapsed.set(v);
  }

  // mobile helpers
  openMobile() {
    this.mobileOpen.set(true);
  }
  closeMobile() {
    this.mobileOpen.set(false);
  }
  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  private read(): boolean {
    if (!this.isBrowser) return false;
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? 'false');
    } catch {
      return false;
    }
  }
}
