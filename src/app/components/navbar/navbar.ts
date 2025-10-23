import { Component, input, output, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ThemeToggleComponent } from '../theme/theme';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, AvatarModule, BadgeModule, ThemeToggleComponent],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  title = input.required<string>();
  menuToggle = output<void>();

  private router = inject(Router);
  private rootRoute = inject(ActivatedRoute);

  routeLabel = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let r: ActivatedRoute | null = this.rootRoute;
        while (r?.firstChild) r = r.firstChild;
        const label = r?.snapshot.data?.['label'];
        if (label) return label as string;
        const p = r?.snapshot.routeConfig?.path ?? '';
        if (!p) return 'Dashboard';
        return p.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }),
    ),
    { initialValue: 'Dashboard' },
  );
}
