import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { MaintenanceTicketApiService, MaintenanceTicketResponse } from '../../../core/services/api/maintenance-ticket-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-manager-maintenance',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Maintenance Reports</h2>
    <div class="cards-grid">
      <app-card variant="stat"><span>Total</span><h3>{{ activeTickets().length }}</h3></app-card>
      <app-card variant="stat"><span>Open</span><h3 style="color:var(--accent-red);">{{ countByStatus('Open') }}</h3></app-card>
      <app-card variant="stat"><span>Assigned</span><h3 style="color:#f59e0b;">{{ countByStatus('Assigned') }}</h3></app-card>
      <app-card variant="stat"><span>Completed</span><h3 style="color:var(--accent-green);">{{ countByStatus('Completed') }}</h3></app-card>
    </div>
    <app-card>
      <h3 style="margin:0 0 16px; font-size:var(--font-base); font-weight:700;">Active Tickets</h3>
      @if (activeTickets().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>Machine ID</th><th>Machine Name</th>
                <th>Hours Used</th><th>Threshold</th><th>Raised Date</th>
                <th>Priority</th><th>Status</th><th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              @for (t of activeTickets(); track t.id) {
                <tr>
                  <td><strong>{{ t.ticketCode }}</strong></td>
                  <td>{{ t.machineId }}</td>
                  <td>{{ t.machineName }}</td>
                  <td style="color:var(--accent-red); font-weight:600;">{{ t.hoursUsed }}h</td>
                  <td>{{ t.thresholdHours }}h</td>
                  <td>{{ t.raisedAt | date:'yyyy-MM-dd' }}</td>
                  <td>
                    <span class="badge" [class.badge--high]="t.priority === 'High'" [class.badge--medium]="t.priority === 'Medium'">{{ t.priority }}</span>
                  </td>
                  <td>
                    <span class="badge"
                      [class.badge--open]="t.status === 'Open'"
                      [class.badge--pending]="t.status === 'Assigned' || t.status === 'In_Progress'">{{ t.status }}</span>
                  </td>
                  <td>{{ t.assignedTo || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No active tickets</div>
          <div class="empty-state__msg">Tickets are auto-generated when a machine crosses its usage threshold.</div>
        </div>
      }
    </app-card>

    @if (completedTickets().length > 0) {
      <app-card style="margin-top: var(--space-5);">
        <div class="section-header">
          <h3 style="margin:0; font-size:var(--font-base); font-weight:700;">Task History</h3>
          <app-button variant="danger" size="sm" (clicked)="clearCompleted()">Clear History</app-button>
        </div>
        <div style="overflow-x:auto; margin-top: var(--space-4);">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>Machine ID</th><th>Machine Name</th>
                <th>Hours Used</th><th>Threshold</th><th>Raised Date</th>
                <th>Priority</th><th>Status</th><th>Assigned To</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (t of completedTickets(); track t.id) {
                <tr>
                  <td><strong>{{ t.ticketCode }}</strong></td>
                  <td>{{ t.machineId }}</td>
                  <td>{{ t.machineName }}</td>
                  <td style="font-weight:600;">{{ t.hoursUsed }}h</td>
                  <td>{{ t.thresholdHours }}h</td>
                  <td>{{ t.raisedAt | date:'yyyy-MM-dd' }}</td>
                  <td>
                    <span class="badge" [class.badge--high]="t.priority === 'High'" [class.badge--medium]="t.priority === 'Medium'">{{ t.priority }}</span>
                  </td>
                  <td><span class="badge badge--approved">{{ t.status }}</span></td>
                  <td>{{ t.assignedTo || '—' }}</td>
                  <td>
                    <button class="icon-btn" title="Delete record" (click)="deleteTicket(t.id)">&#10005;</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    }
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    .icon-btn {
      background: none; border: 1px solid var(--gray-border); border-radius: var(--radius-sm);
      padding: 3px 8px; cursor: pointer; color: var(--text-muted); font-size: var(--font-xs);
      transition: background var(--transition), color var(--transition);
    }
    .icon-btn:hover { background: #fee2e2; color: var(--accent-red); border-color: #fca5a5; }
  `]
})
export class ManagerMaintenanceComponent implements OnInit {
  private api     = inject(MaintenanceTicketApiService);
  private confirm = inject(ConfirmService);
  tickets = signal<MaintenanceTicketResponse[]>([]);
  activeTickets    = computed(() => this.tickets().filter(t => t.status !== 'Completed'));
  completedTickets = computed(() => this.tickets().filter(t => t.status === 'Completed'));

  ngOnInit() {
    this.api.getAll().subscribe({ next: list => this.tickets.set(list) });
  }

  countByStatus(status: string): number {
    return this.tickets().filter(t => t.status === status).length;
  }

  async deleteTicket(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this completed ticket record?'))) return;
    this.api.delete(id).subscribe({
      next: () => this.tickets.update(list => list.filter(t => t.id !== id))
    });
  }

  async clearCompleted(): Promise<void> {
    if (!(await this.confirm.ask('Clear all completed ticket history? This cannot be undone.'))) return;
    this.api.deleteCompleted().subscribe({
      next: () => this.tickets.update(list => list.filter(t => t.status !== 'Completed'))
    });
  }
}
