import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../../services/sidebar/sidebar';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  private svc = inject(SidebarService);
  collapsed = computed(() => this.svc.collapsed());
  mobileOpen = computed(() => this.svc.mobileOpen());

  closeMobile() {
    this.svc.closeMobile();
  }
}
