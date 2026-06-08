import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

export interface NavItem { label: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" role="navigation" aria-label="Sidebar">
      <nav>
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active">{{ item.label }}</a>
        }
      </nav>
      <button class="btn-logout" (click)="logout()">Log Out</button>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
