import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';

export interface SidebarLink { label: string; path: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" role="navigation" aria-label="Sidebar navigation">
      <nav>
        <a *ngFor="let link of links"
           [routerLink]="link.path"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{exact: link.path.split('/').length <= 2}">
          {{ link.label }}
        </a>
      </nav>
      <button class="logout" (click)="logout()">Log Out</button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100%;
      background: var(--brown-900);
      display: flex;
      flex-direction: column;
      padding: var(--space-4) 0;
      color: #fff;
      flex-shrink: 0;
      overflow-y: auto;
    }
    .sidebar nav { flex: 1; display: flex; flex-direction: column; padding-top: var(--space-2); }
    .sidebar nav a {
      display: block;
      padding: 14px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: var(--font-sm);
      font-weight: 500;
      border-left: 3px solid transparent;
      transition: background var(--transition), color var(--transition), border-left-color var(--transition), padding-left var(--transition);
    }
    .sidebar nav a:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
      padding-left: 24px;
    }
    .sidebar nav a.active {
      color: #fff;
      background: var(--red-700);
      font-weight: 700;
      border-left-color: rgba(255,255,255,0.6);
    }
    .logout {
      margin: var(--space-6) var(--space-4) var(--space-4);
      padding: 10px;
      border-radius: var(--radius-md);
      background: #fff;
      color: var(--red-700);
      border: none;
      cursor: pointer;
      font-size: var(--font-sm);
      font-weight: 700;
      transition: background var(--transition), color var(--transition);
    }
    .logout:hover { background: var(--red-300); color: #fff; }
    @media (max-width: 768px) {
      .sidebar { width: 100%; min-height: auto; flex-direction: row; padding: var(--space-2); flex-wrap: wrap; height: auto; position: relative; }
      .sidebar nav { flex-direction: row; flex-wrap: wrap; padding-top: 0; }
      .sidebar nav a { padding: 8px 12px; }
      .logout { margin: var(--space-2); }
    }
  `]
})
export class SidebarComponent {
  @Input() links: SidebarLink[] = [];
  private confirm = inject(ConfirmService);
  constructor(public auth: AuthService) {}

  async logout(): Promise<void> {
    if (!(await this.confirm.ask('Are you sure you want to log out?', 'Log Out'))) return;
    this.auth.logout();
  }
}
