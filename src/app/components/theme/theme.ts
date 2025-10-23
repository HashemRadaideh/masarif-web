import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Theme, ThemeService } from '../../services/theme/theme';

@Component({
  selector: 'app-theme',
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './theme.html',
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
