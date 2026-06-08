import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MachineApiService } from '../../core/services/api/machine-api.service';
import { MaintenanceTicketApiService } from '../../core/services/api/maintenance-ticket-api.service';
import { MaintenanceIssueApiService } from '../../core/services/api/maintenance-issue-api.service';
import { SpareRequestApiService } from '../../core/services/api/spare-request-api.service';
import { InventoryApiService } from '../../core/services/api/inventory-api.service';
import { ProcurementApiService } from '../../core/services/api/procurement-api.service';
import { TicketApiService } from '../../core/services/api/ticket-api.service';
import { WorkerApiService } from '../../core/services/api/worker-api.service';

interface Notif { message: string; route: string; queryParams?: Record<string, string>; }

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif">
      <button class="notif__btn" (click)="toggle()" type="button" [attr.aria-expanded]="open()">
        Notifications
        @if (items().length) {
          <span class="notif__badge">{{ items().length }}</span>
        }
      </button>
      @if (open()) {
        <div class="notif__dropdown">
          <h4>Notifications</h4>
          @if (items().length) {
            <ul>
              @for (item of items(); track item.message) {
                <li class="notif__item" (click)="navigate(item)" role="button" tabindex="0"
                    (keydown.enter)="navigate(item)">
                  <span>{{ item.message }}</span>
                  <span class="notif__arrow">&#8594;</span>
                </li>
              }
            </ul>
          } @else {
            <p class="notif__empty">No new notifications</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif { position: relative; }
    .notif__btn {
      background: var(--red-700); color: #fff;
      border: none; border-radius: var(--radius-md);
      padding: 8px 16px; cursor: pointer; font-size: var(--font-sm); font-weight: 600;
      transition: background var(--transition);
      display: flex; align-items: center; gap: 8px;
    }
    .notif__btn:hover { background: var(--red-500); }
    .notif__badge {
      background: #fff; color: var(--red-700);
      border-radius: 999px; font-size: 11px; font-weight: 800;
      min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }
    .notif__dropdown {
      position: absolute; right: 0; top: calc(100% + 8px);
      background: var(--white); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg); min-width: 300px; z-index: 200;
      padding: var(--space-4); animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: none; } }
    .notif__dropdown h4 { font-size: var(--font-sm); font-weight: 700; margin-bottom: var(--space-3); color: var(--text-dark); }
    .notif__item {
      font-size: var(--font-sm); border-bottom: 1px solid var(--gray-border);
      color: var(--text-dark); list-style: none; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      padding: 10px; margin: 0 -10px; border-radius: var(--radius-sm);
      transition: background var(--transition), color var(--transition);
    }
    .notif__item:hover { background: #fff5f5; color: var(--red-700); }
    .notif__item:last-child { border-bottom: none; }
    .notif__arrow { font-size: 12px; opacity: 0.55; flex-shrink: 0; }
    .notif__empty { font-size: var(--font-sm); color: var(--text-muted); text-align: center; padding: var(--space-3) 0; }
  `]
})
export class NotificationComponent implements OnInit {
  private auth         = inject(AuthService);
  private router       = inject(Router);
  private machineApi   = inject(MachineApiService);
  private mTicketApi   = inject(MaintenanceTicketApiService);
  private issueApi     = inject(MaintenanceIssueApiService);
  private spareApi     = inject(SpareRequestApiService);
  private invApi       = inject(InventoryApiService);
  private procApi      = inject(ProcurementApiService);
  private ticketApi    = inject(TicketApiService);
  private workerApi    = inject(WorkerApiService);

  open  = signal(false);
  items = signal<Notif[]>([]);

  toggle() { this.open.update(v => !v); }

  navigate(item: Notif): void {
    this.open.set(false);
    this.items.update(list => list.filter(n => n.message !== item.message));
    this.router.navigate([item.route], item.queryParams ? { queryParams: item.queryParams } : {});
  }

  ngOnInit() {
    switch (this.auth.getRole()) {
      case 'manager':
      case 'maintenance_manager': this.loadManager();              break;
      case 'supervisor':          this.loadSupervisor();           break;
      case 'technician':          this.loadTechnician();           break;
      case 'maintenance_supervisor': this.loadMaintenanceSup();   break;
      case 'procurement':         this.loadProcurement();          break;
      case 'inventory':           this.loadInventory();            break;
      case 'admin':               this.loadAdmin();                break;
    }
  }

  private collect(notifs: Notif[], total: number, flush: () => void) {
    let remaining = total;
    return (n: Notif | null) => { if (n) notifs.push(n); if (--remaining === 0) flush(); };
  }

  private loadManager(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 3, () => this.items.set(notifs));

    this.machineApi.getAll().subscribe({
      next: list => { const n = list.filter(m => m.status === 'Maintenance').length;
        add(n ? { message: `${n} machine${n > 1 ? 's' : ''} under maintenance`, route: '/manager/machines' } : null); },
      error: () => add(null),
    });
    this.mTicketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open maintenance ticket${n > 1 ? 's' : ''}`, route: '/manager/maintenance' } : null); },
      error: () => add(null),
    });
    this.spareApi.getAll().subscribe({
      next: list => { const n = list.filter(r => r.status === 'Pending').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} awaiting approval`, route: '/manager/procurement' } : null); },
      error: () => add(null),
    });
  }

  private loadSupervisor(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 1, () => this.items.set(notifs));

    this.ticketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open ticket${n > 1 ? 's' : ''} pending action`, route: '/supervisor' } : null); },
      error: () => add(null),
    });
  }

  private loadTechnician(): void {
    const notifs: Notif[] = [];
    const name  = this.auth.currentUser()?.name  ?? '';
    const empId = this.auth.currentUser()?.empId ?? '';
    const add = this.collect(notifs, 2, () => this.items.set(notifs));

    this.mTicketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.assignedTo === name && t.status !== 'Completed').length;
        add(n ? { message: `${n} task${n > 1 ? 's' : ''} assigned to you`, route: '/technician/tasks' } : null); },
      error: () => add(null),
    });
    this.spareApi.getByUser(empId).subscribe({
      next: list => { const n = list.filter(r => r.status !== 'Fulfilled' && r.status !== 'SentToExternal' && r.status !== 'Rejected').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} in progress`, route: '/technician/spare-requests' } : null); },
      error: () => add(null),
    });
  }

  private loadMaintenanceSup(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 2, () => this.items.set(notifs));

    this.issueApi.getAll().subscribe({
      next: list => { const n = list.filter(i => i.status === 'Open').length;
        add(n ? { message: `${n} open maintenance issue${n > 1 ? 's' : ''}`, route: '/maintenance/issue-status' } : null); },
      error: () => add(null),
    });
    this.machineApi.getAll().subscribe({
      next: list => { const n = list.filter(m => m.status === 'Maintenance').length;
        add(n ? { message: `${n} machine${n > 1 ? 's' : ''} under maintenance`, route: '/maintenance/status-dashboard' } : null); },
      error: () => add(null),
    });
  }

  private loadProcurement(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 2, () => this.items.set(notifs));

    this.spareApi.getAll().subscribe({
      next: list => { const n = list.filter(r => r.status === 'Approved').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} need procurement decision`, route: '/procurement', queryParams: { tab: 'spare' } } : null); },
      error: () => add(null),
    });
    this.procApi.getAllTickets().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open department ticket${n > 1 ? 's' : ''}`, route: '/procurement', queryParams: { tab: 'tickets' } } : null); },
      error: () => add(null),
    });
  }

  private loadInventory(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 3, () => this.items.set(notifs));

    this.invApi.getAll().subscribe({
      next: list => { const n = list.filter(i => i.qty < i.threshold).length;
        add(n ? { message: `${n} stock item${n > 1 ? 's' : ''} below threshold`, route: '/inventory', queryParams: { tab: 'threshold' } } : null); },
      error: () => add(null),
    });
    this.spareApi.getAll().subscribe({
      next: list => { const n = list.filter(r => r.status === 'ProcurementApproved').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} ready to fulfill`, route: '/inventory', queryParams: { tab: 'spare' } } : null); },
      error: () => add(null),
    });
    this.ticketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.currentDepartment === 'Inventory' && t.status !== 'Closed').length;
        add(n ? { message: `${n} open inventory ticket${n > 1 ? 's' : ''}`, route: '/inventory', queryParams: { tab: 'tickets' } } : null); },
      error: () => add(null),
    });
  }

  private loadAdmin(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 1, () => this.items.set(notifs));

    this.workerApi.getAll().subscribe({
      next: list => {
        add(list.length
          ? { message: `${list.length} worker${list.length > 1 ? 's' : ''} registered`, route: '/admin/workers' }
          : { message: 'No workers registered yet', route: '/admin/workers' });
      },
      error: () => add(null),
    });
  }
}
