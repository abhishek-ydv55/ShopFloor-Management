import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../ui/card/card.component';
import { MaintenanceIssueApiService, MaintenanceIssueResponse } from '../../../core/services/api/maintenance-issue-api.service';
import { MachineApiService } from '../../../core/services/api/machine-api.service';

@Component({
  selector: 'app-maintenance-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <h2 class="page-title">Maintenance Dashboard</h2>

    <div class="cards-grid">
      <app-card variant="stat"><span>Total Issues</span><h3>{{ issues().length }}</h3></app-card>
      <app-card variant="stat"><span>Open Issues</span><h3>{{ openCount() }}</h3></app-card>
      <app-card variant="stat"><span>In Progress</span><h3>{{ inProgressCount() }}</h3></app-card>
      <app-card variant="stat"><span>Machines</span><h3>{{ machineCount() }}</h3></app-card>
    </div>
    <app-card>
      <h3 style="margin-bottom:16px;">Recent Issues</h3>
      @if (recentIssues().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead><tr><th>Machine</th><th>Type</th><th>Severity</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              @for (i of recentIssues(); track i.id) {
                <tr>
                  <td>{{ i.machine }}</td>
                  <td>{{ i.type }}</td>
                  <td><span class="badge" [class.badge--high]="i.severity==='High'" [class.badge--medium]="i.severity==='Medium'" [class.badge--low]="i.severity==='Low'">{{ i.severity }}</span></td>
                  <td>{{ i.date }}</td>
                  <td><span class="badge" [class.badge--open]="i.status==='Open'" [class.badge--pending]="i.status==='In_Progress'" [class.badge--approved]="i.status==='Closed'">{{ i.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p style="color:var(--text-muted);font-size:var(--font-sm);">No issues reported yet.</p>
      }
    </app-card>
  `
})
export class MaintenanceDashboardComponent implements OnInit {
  private issueApi   = inject(MaintenanceIssueApiService);
  private machineApi = inject(MachineApiService);

  issues       = signal<MaintenanceIssueResponse[]>([]);
  machineCount = signal(0);

  openCount       = computed(() => this.issues().filter(i => i.status === 'Open').length);
  inProgressCount = computed(() => this.issues().filter(i => i.status === 'In_Progress').length);
  recentIssues    = computed(() => [...this.issues()].reverse().slice(0, 5));

  ngOnInit() {
    this.issueApi.getAll().subscribe({ next: list => this.issues.set(list) });
    this.machineApi.getAll().subscribe({ next: list => this.machineCount.set(list.length) });
  }
}
