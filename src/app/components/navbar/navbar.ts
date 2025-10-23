import { Component, input, output, inject } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterLink,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    ThemeToggleComponent,
  ],
  template: `
    <nav class="bg-muted text-muted-foreground">
      <div class="md:hidden flex items-center justify-between px-3 py-3">
        <div class="flex items-center gap-3">
          <button
            pButton
            type="button"
            icon="pi pi-bars"
            class="p-button-text text-muted-foreground! p-button-rounded"
            (click)="menuToggle.emit()"
            aria-label="Toggle sidebar"
          ></button>
          <span class="text-xl font-semibold text-primary">
            {{ title() }}
          </span>
          <span
            class="text-xs text-foreground/50 border border-gray-500 rounded px-2 py-0.5 ml-2 cursor-default"
          >
            {{ routeLabel() }}
          </span>
        </div>
        <div class="flex items-center gap-5">
          <app-theme-toggle />
          <p-avatar
            icon="pi pi-user"
            shape="circle"
            class="cursor-pointer"
          ></p-avatar>
        </div>
      </div>

      <div
        class="hidden md:grid items-center h-14 pr-4 md:grid-cols-[64px_1fr]"
      >
        <div class="flex items-center justify-start pl-3">
          <button
            pButton
            type="button"
            icon="pi pi-bars"
            class="p-button-text text-muted-foreground! p-button-rounded"
            (click)="menuToggle.emit()"
            aria-label="Toggle sidebar"
          ></button>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl font-semibold text-primary cursor-default">
              {{ title() }}
            </span>
            <span
              class="text-xs text-foreground/50 border border-gray-500 rounded px-2 py-0.5 cursor-default"
            >
              {{ routeLabel() }}
            </span>
          </div>
          <div class="flex items-center gap-5">
            <app-theme-toggle />
            <p-avatar
              icon="pi pi-user"
              shape="circle"
              class="cursor-pointer"
            ></p-avatar>
          </div>
        </div>
      </div>
    </nav>
  `,
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
