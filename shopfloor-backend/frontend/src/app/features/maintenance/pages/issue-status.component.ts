import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { MaintenanceIssueApiService, MaintenanceIssueResponse } from '../../../core/services/api/maintenance-issue-api.service';

@Component({
  selector: 'app-issue-status',
  standalone: true,
  imports: [FormsModule, CardComponent],
  template: `
    <h2 class="page-title">Issue Status</h2>
    <app-card>
      <div style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
        <select [(ngModel)]="filterStatus" (change)="applyFilter()" style="padding:8px;">
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In_Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <input type="text" [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search machine..." style="flex:1; min-width:180px; padding:8px;" />
      </div>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr><th>Machine</th><th>Type</th><th>Severity</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (i of filtered(); track i.id) {
              <tr>
                <td>{{ i.machine }}</td>
                <td>{{ i.type }}</td>
                <td><span class="badge" [class.badge--high]="i.severity==='High'" [class.badge--medium]="i.severity==='Medium'" [class.badge--low]="i.severity==='Low'">{{ i.severity }}</span></td>
                <td>{{ i.date }}</td>
                <td><span class="badge" [class.badge--open]="i.status==='Open'" [class.badge--pending]="i.status==='In_Progress'" [class.badge--approved]="i.status==='Closed'">{{ i.status }}</span></td>
              </tr>
            }
            @if (filtered().length === 0) {
              <tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-muted);">No issues found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `
})
export class IssueStatusComponent implements OnInit {
  private api = inject(MaintenanceIssueApiService);

  private allIssues: MaintenanceIssueResponse[] = [];
  filtered     = signal<MaintenanceIssueResponse[]>([]);
  filterStatus = '';
  searchText   = '';

  ngOnInit() {
    this.api.getAll().subscribe({
      next: list => { this.allIssues = list; this.applyFilter(); }
    });
  }

  applyFilter() {
    this.filtered.set(this.allIssues.filter(i =>
      (!this.filterStatus || i.status === this.filterStatus) &&
      (!this.searchText   || i.machine.toLowerCase().includes(this.searchText.toLowerCase()))
    ));
  }
}
