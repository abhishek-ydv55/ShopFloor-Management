import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, SidebarLink } from '../../ui/sidebar/sidebar.component';
import { DashboardTopbarComponent } from '../../ui/dashboard-topbar/dashboard-topbar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, DashboardTopbarComponent],
  template: `
    <div class="app-shell">
      <app-dashboard-topbar title="Admin"></app-dashboard-topbar>
      <div class="app-body">
        <app-sidebar [links]="links"></app-sidebar>
        <div class="main-content">
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminShellComponent {
  links: SidebarLink[] = [
    { label: 'Home',           path: '/admin' },
    { label: 'Manage Workers', path: '/admin/workers' },
  ];
}
