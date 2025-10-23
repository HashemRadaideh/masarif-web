import { Component, inject } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { SidebarService } from './services/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, SidebarComponent, RouterOutlet, ToastModule],
  templateUrl: './app.html',
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
