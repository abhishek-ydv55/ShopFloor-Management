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

interface Notif { message: string; detail: string; route: string; queryParams?: Record<string, string>; }

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
          <div class="notif__header">
            <span class="notif__header-title">Notifications</span>
            @if (items().length) {
              <span class="notif__header-count">{{ items().length }} new</span>
            }
          </div>
          @if (items().length) {
            <ul class="notif__list">
              @for (item of items(); track item.message) {
                <li class="notif__item" (click)="navigate(item)" role="button" tabindex="0"
                    (keydown.enter)="navigate(item)">
                  <span class="notif__dot"></span>
                  <div class="notif__item-body">
                    <span class="notif__item-msg">{{ item.message }}</span>
                    <span class="notif__item-detail">{{ item.detail }}</span>
                  </div>
                  <span class="notif__arrow">&#8594;</span>
                </li>
              }
            </ul>
          } @else {
            <div class="notif__empty">
              <p>No new notifications</p>
            </div>
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
      position: absolute; right: 0; top: calc(100% + 10px);
      background: var(--white); border-radius: 12px;
      border: 1.5px solid #d1d5db;
      box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
      min-width: 340px; z-index: 200; overflow: hidden;
      animation: fadeIn 0.18s ease;
    }
    @keyframes fadeIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: none; } }
    .notif__header {
      background: var(--red-700);
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px; border-bottom: 1.5px solid rgba(0,0,0,0.08);
    }
    .notif__header-title { font-size: var(--font-sm); font-weight: 700; color: #fff; }
    .notif__header-count {
      background: rgba(255,255,255,0.22); color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 2px 9px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.3);
    }
    .notif__list { list-style: none; margin: 0; padding: 6px 0; }
    .notif__item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; cursor: pointer;
      border-left: 3px solid transparent;
      border-bottom: 1px solid #f0f0f0;
      transition: background var(--transition), border-left-color var(--transition);
    }
    .notif__item:last-child { border-bottom: none; }
    .notif__item:hover { background: #fff5f5; border-left-color: var(--red-700); }
    .notif__dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--red-700); flex-shrink: 0; margin-top: 5px;
    }
    .notif__item-body { flex: 1; min-width: 0; }
    .notif__item-msg { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); }
    .notif__item-detail { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
    .notif__arrow { font-size: 12px; color: var(--text-muted); flex-shrink: 0; margin-top: 4px; }
    .notif__empty { padding: 28px 16px; text-align: center; }
    .notif__empty p { font-size: var(--font-sm); color: var(--text-muted); }
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
        add(n ? { message: `${n} machine${n > 1 ? 's' : ''} under maintenance`, detail: 'Maintenance in progress — check machine status', route: '/manager/machines' } : null); },
      error: () => add(null),
    });
    this.mTicketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open maintenance ticket${n > 1 ? 's' : ''}`, detail: 'Pending review and coordination', route: '/manager/maintenance' } : null); },
      error: () => add(null),
    });
    this.spareApi.getAll().subscribe({
      next: list => { const n = list.filter(r => r.status === 'Pending').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} awaiting approval`, detail: 'Approve or reject to unblock the team', route: '/manager/procurement' } : null); },
      error: () => add(null),
    });
  }

  private loadSupervisor(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 1, () => this.items.set(notifs));

    this.ticketApi.getAll().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open ticket${n > 1 ? 's' : ''} pending action`, detail: 'Review and assign or escalate to the right team', route: '/supervisor' } : null); },
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
        add(n ? { message: `${n} task${n > 1 ? 's' : ''} assigned to you`, detail: 'View assigned tasks and update progress', route: '/technician/tasks' } : null); },
      error: () => add(null),
    });
    this.spareApi.getByUser(empId).subscribe({
      next: list => { const n = list.filter(r => r.status !== 'Fulfilled' && r.status !== 'SentToExternal' && r.status !== 'Rejected').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} in progress`, detail: 'Track fulfillment and delivery status', route: '/technician/spare-requests' } : null); },
      error: () => add(null),
    });
  }

  private loadMaintenanceSup(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 2, () => this.items.set(notifs));

    this.issueApi.getAll().subscribe({
      next: list => { const n = list.filter(i => i.status === 'Open').length;
        add(n ? { message: `${n} open maintenance issue${n > 1 ? 's' : ''}`, detail: 'Diagnose and assign repair actions', route: '/maintenance/issue-status' } : null); },
      error: () => add(null),
    });
    this.machineApi.getAll().subscribe({
      next: list => { const n = list.filter(m => m.status === 'Maintenance').length;
        add(n ? { message: `${n} machine${n > 1 ? 's' : ''} under maintenance`, detail: 'Monitor repair progress and timeline', route: '/maintenance/status-dashboard' } : null); },
      error: () => add(null),
    });
  }

  private loadProcurement(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 2, () => this.items.set(notifs));

    this.spareApi.getAll().subscribe({
      next: list => { const n = list.filter(r => r.status === 'Approved').length;
        add(n ? { message: `${n} spare request${n > 1 ? 's' : ''} need procurement decision`, detail: 'Approve, reject, or send to external vendor', route: '/procurement', queryParams: { tab: 'spare' } } : null); },
      error: () => add(null),
    });
    this.procApi.getAllTickets().subscribe({
      next: list => { const n = list.filter(t => t.status === 'Open').length;
        add(n ? { message: `${n} open department ticket${n > 1 ? 's' : ''}`, detail: 'Review and process procurement requests', route: '/procurement', queryParams: { tab: 'tickets' } } : null); },
      error: () => add(null),
    });
  }

  private loadInventory(): void {
    const notifs: Notif[] = [];
    let pending = 3;
    const flush = () => { if (--pending === 0) this.items.set(notifs); };

    this.invApi.getAll().subscribe({
      next: list => {
        const n = list.filter(i => i.qty < i.threshold).length;
        if (n) notifs.push({ message: `${n} stock item${n > 1 ? 's' : ''} below threshold`, detail: 'Reorder soon to prevent stockout', route: '/inventory', queryParams: { tab: 'threshold' } });
        flush();
      },
      error: () => flush(),
    });
    this.spareApi.getAll().subscribe({
      next: list => {
        const readyN = list.filter(r => r.status === 'ProcurementApproved').length;
        const extN   = list.filter(r => r.status === 'SentToExternal').length;
        if (readyN) notifs.push({ message: `${readyN} spare request${readyN > 1 ? 's' : ''} ready to fulfill`, detail: 'Deduct from stock or escalate to external procurement', route: '/inventory', queryParams: { tab: 'spare' } });
        if (extN)   notifs.push({ message: `${extN} item${extN > 1 ? 's' : ''} sent for external procurement`, detail: 'Awaiting vendor fulfillment — track in Spare Parts', route: '/inventory', queryParams: { tab: 'spare' } });
        flush();
      },
      error: () => flush(),
    });
    this.ticketApi.getAll().subscribe({
      next: list => {
        const n = list.filter(t => t.currentDepartment === 'Inventory' && t.status !== 'Closed').length;
        if (n) notifs.push({ message: `${n} open inventory ticket${n > 1 ? 's' : ''}`, detail: 'Close tickets with resolution notes', route: '/inventory', queryParams: { tab: 'tickets' } });
        flush();
      },
      error: () => flush(),
    });
  }

  private loadAdmin(): void {
    const notifs: Notif[] = [];
    const add = this.collect(notifs, 1, () => this.items.set(notifs));

    this.workerApi.getAll().subscribe({
      next: list => {
        add(list.length
          ? { message: `${list.length} worker${list.length > 1 ? 's' : ''} registered`, detail: 'View and manage your workforce', route: '/admin/workers' }
          : { message: 'No workers registered yet', detail: 'Add the first worker to get started', route: '/admin/workers' });
      },
      error: () => add(null),
    });
  }
}
