import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, SidebarLink } from '../../ui/sidebar/sidebar.component';
import { DashboardTopbarComponent } from '../../ui/dashboard-topbar/dashboard-topbar.component';

@Component({
  selector: 'app-manager-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, DashboardTopbarComponent],
  template: `
    <div class="app-shell">
      <app-dashboard-topbar title="Manager"></app-dashboard-topbar>
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
export class ManagerShellComponent {
  links: SidebarLink[] = [
    { label: 'Dashboard',            path: '/manager' },
    { label: 'Maintenance Reports',  path: '/manager/maintenance' },
    { label: 'Assign Technician',    path: '/manager/assign-technician' },
    { label: 'Procurement Requests', path: '/manager/procurement' },
    { label: 'Manage Machines',      path: '/manager/machines' },
    { label: 'Supervisor Tickets',   path: '/manager/supervisor-tickets' },
  ];
}
