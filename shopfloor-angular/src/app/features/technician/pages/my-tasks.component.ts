import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { MaintenanceTicketApiService, MaintenanceTicketResponse } from '../../../core/services/api/maintenance-ticket-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">My Assigned Maintenance Tasks</h2>

    <!-- Active tasks -->
    <app-card>
      <h3 style="margin-bottom:16px;">Active Tasks</h3>
      @if (activeTasks().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Task ID</th><th>Machine</th><th>Priority</th><th>Raised On</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (t of activeTasks(); track t.id) {
                <tr>
                  <td><strong>{{ t.taskId || t.ticketCode }}</strong></td>
                  <td>{{ t.machineId }} – {{ t.machineName }}</td>
                  <td>
                    <span class="badge" [class.badge--high]="t.priority === 'High'" [class.badge--medium]="t.priority === 'Medium'" [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                  </td>
                  <td>{{ t.raisedAt.substring(0, 10) }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--pending]="t.status === 'Assigned'"
                      [class.badge--open]="t.status === 'In_Progress'">{{ t.status }}</span>
                  </td>
                  <td>
                    <app-button size="sm" (clicked)="advance(t)">
                      {{ t.status === 'Assigned' ? 'Start' : 'Complete' }}
                    </app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No active tasks</div>
          <div class="empty-state__msg">Tasks assigned to you by the manager will appear here.</div>
        </div>
      }
    </app-card>

    <!-- Task history -->
    @if (taskHistory().length > 0) {
      <app-card style="margin-top: var(--space-5);">
        <h3 style="margin-bottom:16px;">Task History</h3>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Task ID</th><th>Machine</th><th>Priority</th><th>Raised On</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of taskHistory(); track t.id) {
                <tr>
                  <td><strong>{{ t.taskId || t.ticketCode }}</strong></td>
                  <td>{{ t.machineId }} – {{ t.machineName }}</td>
                  <td>
                    <span class="badge" [class.badge--high]="t.priority === 'High'" [class.badge--medium]="t.priority === 'Medium'" [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                  </td>
                  <td>{{ t.raisedAt.substring(0, 10) }}</td>
                  <td>
                    <span class="badge badge--approved">{{ t.status }}</span>
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
export class MyTasksComponent implements OnInit {
  private api     = inject(MaintenanceTicketApiService);
  private auth    = inject(AuthService);
  private confirm = inject(ConfirmService);

  tasks = signal<MaintenanceTicketResponse[]>([]);

  activeTasks  = computed(() => this.tasks().filter(t => t.status !== 'Completed'));
  taskHistory  = computed(() => this.tasks().filter(t => t.status === 'Completed'));

  ngOnInit() {
    const name = this.auth.currentUser()?.name ?? '';
    this.api.getAll().subscribe({
      next: list => this.tasks.set(list.filter(t => t.assignedTo === name))
    });
  }

  async advance(ticket: MaintenanceTicketResponse): Promise<void> {
    const action = ticket.status === 'Assigned' ? 'Start' : 'Complete';
    if (!(await this.confirm.ask(`${action} task ${ticket.taskId || ticket.ticketCode}?`))) return;
    if (ticket.status === 'Assigned') {
      this.api.updateStatus(ticket.id, 'In_Progress').subscribe({
        next: updated => this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t))
      });
    } else {
      this.api.complete(ticket.id).subscribe({
        next: updated => this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t))
      });
    }
  }
}
