import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { SpareRequestApiService, SpareRequestResponse } from '../../../core/services/api/spare-request-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-manager-procurement',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Spare Part Requests</h2>
    <app-card>
      @if (pending().length > 0) {
        <div class="section-header" style="margin-bottom:var(--space-4);">
          <h3 style="margin:0; font-size:var(--font-base); font-weight:700;">Pending Approval</h3>
        </div>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Request ID</th><th>Part</th><th>Qty</th>
                <th>Machine</th><th>Date</th><th>Priority</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (r of pending(); track r.id) {
                <tr>
                  <td><strong>{{ r.requestCode }}</strong></td>
                  <td>{{ r.item }}</td>
                  <td>{{ r.qty }}</td>
                  <td>{{ r.machine }}</td>
                  <td>{{ r.createdAt }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--high]="r.priority === 'High'"
                      [class.badge--medium]="r.priority === 'Medium'"
                      [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <app-button size="sm" variant="primary" (clicked)="updateStatus(r.id, 'Approved')">Approve</app-button>
                      <app-button size="sm" variant="danger"  (clicked)="updateStatus(r.id, 'Rejected')">Reject</app-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No pending requests</div>
          <div class="empty-state__msg">Spare part requests submitted by technicians will appear here.</div>
        </div>
      }
    </app-card>

    @if (resolved().length > 0) {
      <app-card style="margin-top: var(--space-5);">
        <div class="section-header" style="margin-bottom:var(--space-4);">
          <h3 style="margin:0; font-size:var(--font-base); font-weight:700;">Request History</h3>
          <app-button variant="danger" size="sm" (clicked)="clearResolved()">Clear All</app-button>
        </div>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Request ID</th><th>Part</th><th>Qty</th>
                <th>Machine</th><th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (r of resolved(); track r.id) {
                <tr>
                  <td><strong>{{ r.requestCode }}</strong></td>
                  <td>{{ r.item }}</td>
                  <td>{{ r.qty }}</td>
                  <td>{{ r.machine }}</td>
                  <td>{{ r.createdAt }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--approved]="r.status === 'Fulfilled'"
                      [class.badge--pending]="r.status === 'SentToExternal'"
                      [class.badge--high]="r.status === 'Rejected'">{{ r.status }}</span>
                  </td>
                  <td>
                    <button class="icon-btn" title="Delete record" (click)="deleteRequest(r.id)">&#10005;</button>
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
export class ManagerProcurementComponent implements OnInit {
  private api     = inject(SpareRequestApiService);
  private confirm = inject(ConfirmService);
  requests = signal<SpareRequestResponse[]>([]);

  pending  = computed(() => this.requests().filter(r => r.status === 'Pending'));
  resolved = computed(() => this.requests().filter(r => r.status !== 'Pending' && r.status !== 'Approved' && r.status !== 'ProcurementApproved'));

  ngOnInit() {
    this.api.getAll().subscribe({ next: list => this.requests.set(list) });
  }

  async updateStatus(id: number, status: 'Approved' | 'Rejected'): Promise<void> {
    const action = status === 'Approved' ? 'Approve' : 'Reject';
    if (!(await this.confirm.ask(`${action} this spare request?`))) return;
    this.api.updateStatus(id, status).subscribe({
      next: updated => this.requests.update(list => list.map(r => r.id === id ? updated : r))
    });
  }

  async deleteRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this request record?'))) return;
    this.api.delete(id).subscribe({
      next: () => this.requests.update(list => list.filter(r => r.id !== id))
    });
  }

  async clearResolved(): Promise<void> {
    if (!(await this.confirm.ask('Clear all resolved request history? This cannot be undone.'))) return;
    this.api.deleteCompleted().subscribe({
      next: () => this.requests.update(list => list.filter(r =>
        r.status === 'Pending' || r.status === 'Approved' || r.status === 'ProcurementApproved'
      ))
    });
  }
}
