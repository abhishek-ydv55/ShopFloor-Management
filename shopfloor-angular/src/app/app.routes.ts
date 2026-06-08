import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Landing
  { path: '', loadComponent: () => import('./features/landing/pages/home.component').then(m => m.LandingHomeComponent) },
  { path: 'about',   loadComponent: () => import('./features/landing/pages/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/landing/pages/contact.component').then(m => m.ContactComponent) },

  // Login
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },

  // Admin
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./features/admin/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '',        loadComponent: () => import('./features/admin/pages/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'workers', loadComponent: () => import('./features/admin/pages/manage-workers.component').then(m => m.ManageWorkersComponent) },
    ]
  },

  // Manager
  {
    path: 'manager',
    canActivate: [roleGuard('manager', 'maintenance_manager')],
    loadComponent: () => import('./features/manager/manager-shell.component').then(m => m.ManagerShellComponent),
    children: [
      { path: '',                   loadComponent: () => import('./features/manager/pages/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
      { path: 'maintenance',         loadComponent: () => import('./features/manager/pages/manager-maintenance.component').then(m => m.ManagerMaintenanceComponent) },
      { path: 'assign-technician',   loadComponent: () => import('./features/manager/pages/assign-technician.component').then(m => m.AssignTechnicianComponent) },
      { path: 'procurement',         loadComponent: () => import('./features/manager/pages/manager-procurement.component').then(m => m.ManagerProcurementComponent) },
      { path: 'machines',            loadComponent: () => import('./features/manager/pages/manage-machines.component').then(m => m.ManageMachinesComponent) },
      { path: 'supervisor-tickets',  loadComponent: () => import('./features/maintenance/pages/supervisor-tickets.component').then(m => m.SupervisorTicketsComponent) },
    ]
  },

  // Supervisor
  {
    path: 'supervisor',
    canActivate: [roleGuard('supervisor')],
    loadComponent: () => import('./features/supervisor/supervisor-shell.component').then(m => m.SupervisorShellComponent),
    children: [
      { path: '',              loadComponent: () => import('./features/supervisor/pages/supervisor-home.component').then(m => m.SupervisorHomeComponent) },
      { path: 'dashboard',     loadComponent: () => import('./features/supervisor/pages/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent) },
      { path: 'create-ticket', loadComponent: () => import('./features/supervisor/pages/create-ticket.component').then(m => m.CreateTicketComponent) },
    ]
  },

  // Technician
  {
    path: 'technician',
    canActivate: [roleGuard('technician')],
    loadComponent: () => import('./features/technician/technician-shell.component').then(m => m.TechnicianShellComponent),
    children: [
      { path: '',               loadComponent: () => import('./features/technician/pages/technician-home.component').then(m => m.TechnicianHomeComponent) },
      { path: 'tasks',          loadComponent: () => import('./features/technician/pages/my-tasks.component').then(m => m.MyTasksComponent) },
      { path: 'spare-requests', loadComponent: () => import('./features/technician/pages/spare-requests.component').then(m => m.SpareRequestsComponent) },
    ]
  },

  // Maintenance
  {
    path: 'maintenance',
    canActivate: [roleGuard('maintenance_supervisor')],
    loadComponent: () => import('./features/maintenance/maintenance-shell.component').then(m => m.MaintenanceShellComponent),
    children: [
      { path: '',                 loadComponent: () => import('./features/maintenance/pages/maintenance-dashboard.component').then(m => m.MaintenanceDashboardComponent) },
      { path: 'issue-report',     loadComponent: () => import('./features/maintenance/pages/issue-report.component').then(m => m.IssueReportComponent) },
      { path: 'issue-status',     loadComponent: () => import('./features/maintenance/pages/issue-status.component').then(m => m.IssueStatusComponent) },
      { path: 'status-dashboard',    loadComponent: () => import('./features/maintenance/pages/status-dashboard.component').then(m => m.StatusDashboardComponent) },
      { path: 'use-hour',         loadComponent: () => import('./features/maintenance/pages/use-hour.component').then(m => m.UseHourComponent) },
    ]
  },

  // Standalone pages
  {
    path: 'inventory',
    canActivate: [roleGuard('inventory')],
    loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent),
  },
  {
    path: 'procurement',
    canActivate: [roleGuard('procurement')],
    loadComponent: () => import('./features/procurement/procurement.component').then(m => m.ProcurementComponent),
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
