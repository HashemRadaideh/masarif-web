import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Theme, ThemeService } from './theme.service'; // your service path

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <button
      pButton
      type="button"
      [icon]="icon()"
      (click)="cycle()"
      class="p-button-text p-button-rounded p-button-sm text-foreground! bg-background! hover:bg-border! p-4!"
      aria-label="Toggle theme"
    ></button>
  `,
})
export class ThemeToggleComponent {
  private theme = inject(ThemeService);

  sel = computed<Theme>(() => this.theme.current());

  label = computed(() => {
    const v = this.sel();
    return v.charAt(0).toUpperCase() + v.slice(1);
  });

  icon = computed(() => {
    switch (this.sel()) {
      case 'light':
        return 'pi pi-sun';
      case 'dark':
        return 'pi pi-moon';
      default:
        return 'pi pi-desktop';
    }
  });

  cycle() {
    const order: Theme[] = ['light', 'dark'];
    const i = order.indexOf(this.sel());
    const next = order[(i + 1) % order.length];
    this.theme.set(next);
  }
}
