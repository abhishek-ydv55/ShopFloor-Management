import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { MaintenanceTicketApiService, MaintenanceTicketResponse } from '../../../core/services/api/maintenance-ticket-api.service';
import { SpareRequestApiService } from '../../../core/services/api/spare-request-api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-technician-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <h2 class="page-title">Technician Dashboard</h2>

    <div class="cards-grid">
      <app-card variant="stat"><span>Active Tasks</span><h3>{{ activeCount() }}</h3></app-card>
      <app-card variant="stat"><span>Completed Tasks</span><h3>{{ completedCount() }}</h3></app-card>
      <app-card variant="stat"><span>Pending Spares</span><h3>{{ pendingSpares() }}</h3></app-card>
    </div>

    <app-card>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <h3 style="margin:0;">Task History</h3>
        <input
          type="text"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          placeholder="Search by task ID, machine..."
          style="padding:7px 12px; border:1px solid var(--gray-border); border-radius:var(--radius-md); font-size:var(--font-sm); width:220px;"
        />
      </div>

      @if (filteredHistory().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Task ID</th><th>Machine</th><th>Priority</th><th>Raised On</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of filteredHistory(); track t.id) {
                <tr>
                  <td><strong>{{ t.taskId || t.ticketCode }}</strong></td>
                  <td>{{ t.machineId }} – {{ t.machineName }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--high]="t.priority === 'High'"
                      [class.badge--medium]="t.priority === 'Medium'"
                      [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                  </td>
                  <td>{{ t.raisedAt.substring(0, 10) }}</td>
                  <td><span class="badge badge--approved">{{ t.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">{{ search() ? 'No matching records' : 'No completed tasks yet' }}</div>
          <div class="empty-state__msg">{{ search() ? 'Try a different search term.' : 'Tasks you complete will appear here.' }}</div>
        </div>
      }
    </app-card>
  `
})
export class TechnicianHomeComponent implements OnInit {
  private ticketApi = inject(MaintenanceTicketApiService);
  private spareApi  = inject(SpareRequestApiService);
  private auth      = inject(AuthService);

  allTasks      = signal<MaintenanceTicketResponse[]>([]);
  pendingSpares = signal(0);
  search        = signal('');

  activeCount    = computed(() => this.allTasks().filter(t => t.status !== 'Completed').length);
  completedCount = computed(() => this.allTasks().filter(t => t.status === 'Completed').length);

  filteredHistory = computed(() => {
    const q = this.search().toLowerCase().trim();
    const history = [...this.allTasks().filter(t => t.status === 'Completed')].reverse();
    if (!q) return history;
    return history.filter(t =>
      (t.taskId || t.ticketCode || '').toLowerCase().includes(q) ||
      t.machineId.toLowerCase().includes(q) ||
      t.machineName.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    const name  = this.auth.currentUser()?.name  ?? '';
    const empId = this.auth.currentUser()?.empId ?? '';

    this.ticketApi.getAll().subscribe({
      next: list => this.allTasks.set(list.filter(t => t.assignedTo === name))
    });

    if (empId) {
      this.spareApi.getByUser(empId).subscribe({
        next: list => this.pendingSpares.set(
          list.filter(r => r.status === 'Pending' || r.status === 'Approved' || r.status === 'ProcurementApproved').length
        )
      });
    }
  }
}
