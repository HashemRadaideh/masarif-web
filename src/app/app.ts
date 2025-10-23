import { Component, inject } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { SidebarService } from './components/sidebar/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast'; // ⬅️ add

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, SidebarComponent, RouterOutlet, ToastModule], // ⬅️ add
  template: `
    <div class="h-screen grid grid-rows-[auto_1fr] overflow-hidden">
      <!-- app.component.html template change -->
      <header class="sticky top-0 z-40 shadow-soft h-14">
        <app-navbar [title]="title" (menuToggle)="onMenuToggle()" />
      </header>

      <main class="flex items-start h-full overflow-hidden">
        <app-sidebar />
        <section class="flex-1 h-full overflow-auto">
          <router-outlet />
        </section>
      </main>

      <p-toast position="bottom-right" />
    </div>
  `,
})
export class AppComponent {
  title = 'Masarif';
  sidebar = inject(SidebarService);

  onMenuToggle() {
    if (matchMedia('(min-width: 768px)').matches) {
      this.sidebar.toggle();
    } else {
      this.sidebar.toggleMobile();
    }
  }
}
