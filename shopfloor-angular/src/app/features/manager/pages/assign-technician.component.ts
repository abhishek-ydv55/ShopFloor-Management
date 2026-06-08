import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { MaintenanceTicketApiService, MaintenanceTicketResponse } from '../../../core/services/api/maintenance-ticket-api.service';
import { WorkerApiService, WorkerResponse } from '../../../core/services/api/worker-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-assign-technician',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Assign Technician</h2>
    <app-card>
      <h3 style="margin-bottom:16px;">Pending Maintenance Jobs</h3>
      @if (openTickets().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>Machine ID</th><th>Machine Name</th>
                <th>Hours Used</th><th>Threshold</th><th>Raised Date</th>
                <th>Priority</th><th>Assign To</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (t of openTickets(); track t.id) {
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
                    @if (technicians().length > 0) {
                      <select style="padding:6px; min-width:140px;" [(ngModel)]="assignments[t.id]">
                        <option value="">Select Technician</option>
                        @for (tech of technicians(); track tech.empId) {
                          <option [value]="tech.name">{{ tech.name }} ({{ tech.empId }})</option>
                        }
                      </select>
                    } @else {
                      <span style="color:var(--text-muted); font-size:var(--font-sm);">No technicians registered</span>
                    }
                  </td>
                  <td>
                    <app-button size="sm" (clicked)="assign(t)" [disabled]="!assignments[t.id] || technicians().length === 0">Assign</app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No open tickets</div>
          <div class="empty-state__msg">All maintenance tickets have been assigned or there are no pending tickets.</div>
        </div>
      }
      @if (msg()) {
        <p style="margin-top:12px; color:var(--accent-green); font-weight:600;">{{ msg() }}</p>
      }
    </app-card>

    @if (technicians().length === 0) {
      <app-card style="margin-top: var(--space-5);">
        <p style="color: var(--text-muted); font-size: var(--font-sm);">
          No technicians are registered. Ask the admin to register workers with the <strong>Technician</strong> role.
        </p>
      </app-card>
    }

    <!-- Assignment Log -->
    @if (assignmentLog().length > 0) {
      <app-card style="margin-top: var(--space-5);">
        <h3 style="margin-bottom:16px;">Assignment Log</h3>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>Machine</th><th>Task ID</th>
                <th>Assigned To</th><th>Priority</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of assignmentLog(); track t.id) {
                <tr>
                  <td><strong>{{ t.ticketCode }}</strong></td>
                  <td>{{ t.machineName }}</td>
                  <td>{{ t.taskId || '—' }}</td>
                  <td>{{ t.assignedTo || '—' }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--high]="t.priority === 'High'"
                      [class.badge--medium]="t.priority === 'Medium'">{{ t.priority }}</span>
                  </td>
                  <td>
                    <span class="badge"
                      [class.badge--pending]="t.status === 'Assigned'"
                      [class.badge--medium]="t.status === 'In_Progress'"
                      [class.badge--approved]="t.status === 'Completed'">{{ t.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    }
  `
})
export class AssignTechnicianComponent implements OnInit {
  private ticketApi = inject(MaintenanceTicketApiService);
  private workerApi = inject(WorkerApiService);
  private confirm   = inject(ConfirmService);

  allTickets   = signal<MaintenanceTicketResponse[]>([]);
  technicians  = signal<WorkerResponse[]>([]);
  assignments: Record<number, string> = {};
  msg = signal('');

  openTickets    = computed(() => this.allTickets().filter(t => t.status === 'Open'));
  assignmentLog  = computed(() => this.allTickets().filter(t => t.status !== 'Open'));

  ngOnInit() {
    this.ticketApi.getAll().subscribe({
      next: list => this.allTickets.set(list)
    });
    this.workerApi.getByRole('technician').subscribe({
      next: workers => this.technicians.set(workers.filter(w => w.active))
    });
  }

  async assign(ticket: MaintenanceTicketResponse): Promise<void> {
    const techName = this.assignments[ticket.id];
    if (!techName) return;
    if (!(await this.confirm.ask(`Assign "${techName}" to ticket ${ticket.ticketCode}?`))) return;

    const taskId = `TSK-${Date.now()}`;
    this.ticketApi.assign(ticket.id, techName, taskId).subscribe({
      next: (updated) => {
        this.allTickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        delete this.assignments[ticket.id];
        this.msg.set(`Technician "${techName}" assigned to ticket ${updated.ticketCode}. Task ${taskId} created.`);
        setTimeout(() => this.msg.set(''), 4000);
      },
      error: (err) => this.msg.set(err?.error?.message ?? 'Failed to assign technician')
    });
  }
}
