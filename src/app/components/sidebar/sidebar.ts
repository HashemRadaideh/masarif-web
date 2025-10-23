import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- MENU TEMPLATE (shared content) -->
    <ng-template #menuDesktop>
      <nav class="h-full p-2 flex flex-col justify-between">
        <ul class="space-y-1">
          <li
            routerLink="/"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
            title="Dashboard"
          >
            <i
              class="pi pi-chart-line text-gray-500"
              [class.mx-auto]="collapsed()"
            ></i>
            <span class="truncate" [class.hidden]="collapsed()">Dashboard</span>
          </li>
          <li
            routerLink="/about"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
            title="About"
          >
            <i
              class="pi pi-info-circle text-gray-500"
              [class.mx-auto]="collapsed()"
            ></i>
            <span class="truncate" [class.hidden]="collapsed()">About</span>
          </li>
          <li
            routerLink="/account"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
            title="Account"
          >
            <i
              class="pi pi-user text-gray-500"
              [class.mx-auto]="collapsed()"
            ></i>
            <span class="truncate" [class.hidden]="collapsed()">Account</span>
          </li>
        </ul>

        <ul class="space-y-1 border-t pt-3">
          <li
            class="w-full flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
            title="Find"
          >
            <i
              class="pi pi-search text-gray-500"
              [class.mx-auto]="collapsed()"
            ></i>
            <span class="truncate" [class.hidden]="collapsed()">Find</span>
          </li>
          <li
            class="w-full flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
            title="Settings"
          >
            <i
              class="pi pi-cog text-gray-500"
              [class.mx-auto]="collapsed()"
            ></i>
            <span class="truncate" [class.hidden]="collapsed()">Settings</span>
          </li>
        </ul>
      </nav>
    </ng-template>

    <!-- MOBILE menu (labels always visible) -->
    <ng-template #menuMobile>
      <nav class="p-2 pb-4">
        <ul class="space-y-1">
          <li
            routerLink="/"
            (click)="closeMobile()"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
          >
            <i class="pi pi-chart-line text-gray-500"></i
            ><span class="truncate">Dashboard</span>
          </li>
          <li
            routerLink="/about"
            (click)="closeMobile()"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
          >
            <i class="pi pi-info-circle text-gray-500"></i
            ><span class="truncate">About</span>
          </li>
          <li
            routerLink="/account"
            (click)="closeMobile()"
            class="flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
          >
            <i class="pi pi-user text-gray-500"></i
            ><span class="truncate">Account</span>
          </li>
        </ul>

        <ul class="space-y-1 border-t pt-3 mt-3">
          <li
            (click)="closeMobile()"
            class="w-full flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
          >
            <i class="pi pi-search text-gray-500"></i
            ><span class="truncate">Find</span>
          </li>
          <li
            (click)="closeMobile()"
            class="w-full flex items-center gap-3 rounded-lg hover:bg-foreground/10 px-3 py-2 cursor-pointer"
          >
            <i class="pi pi-cog text-gray-500"></i
            ><span class="truncate">Settings</span>
          </li>
        </ul>
      </nav>
    </ng-template>

    <!-- DESKTOP rail -->
    <aside
      class="sticky top-14 self-start shrink-0
             h-[calc(100vh-56px)] overflow-y-auto
             bg-muted/60 text-muted-foreground border-r
             transition-all duration-200 ease-in-out hidden md:block"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <ng-container [ngTemplateOutlet]="menuDesktop"></ng-container>
    </aside>

    <!-- MOBILE TOP SHEET (slides from top) -->
    <div class="md:hidden">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 transition-opacity duration-200"
        [class.opacity-0]="!mobileOpen()"
        [class.opacity-100]="mobileOpen()"
        [class.pointer-events-none]="!mobileOpen()"
        (click)="closeMobile()"
        [style.background]="mobileOpen() ? 'rgba(0,0,0,0.5)' : 'transparent'"
      ></div>

      <!-- Panel -->
      <div
        class="fixed top-0 left-0 right-0 z-50
                  transition-transform duration-300 ease-out"
        [class.-translate-y-full]="!mobileOpen()"
        [class.translate-y-0]="mobileOpen()"
      >
        <div class="bg-muted text-muted-foreground border-b shadow">
          <div class="flex items-center justify-between px-3 py-2">
            <div class="font-medium">Menu</div>
            <button
              type="button"
              class="p-2 w-16 rounded-lg hover:bg-foreground/10 cursor-pointer"
              (click)="closeMobile()"
              aria-label="Close"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="max-h-[80vh] overflow-y-auto">
            <ng-container [ngTemplateOutlet]="menuMobile"></ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SidebarComponent {
  private svc = inject(SidebarService);
  collapsed = computed(() => this.svc.collapsed());
  mobileOpen = computed(() => this.svc.mobileOpen());

  closeMobile() {
    this.svc.closeMobile();
  }
}
