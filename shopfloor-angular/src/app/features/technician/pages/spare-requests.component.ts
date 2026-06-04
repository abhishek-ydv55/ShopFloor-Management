import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { SpareRequestApiService, SpareRequestResponse } from '../../../core/services/api/spare-request-api.service';
import { MaintenanceTicketApiService, MaintenanceTicketResponse } from '../../../core/services/api/maintenance-ticket-api.service';
import { InventoryApiService, InventoryItemResponse } from '../../../core/services/api/inventory-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-spare-requests',
  standalone: true,
  imports: [FormsModule, CardComponent, FormFieldComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Spare Parts Requests</h2>

    <app-card>
      <h3 style="margin-bottom:16px;">New Request</h3>
      <form (ngSubmit)="submit()" novalidate>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0 20px;">
          <app-form-field label="Part Name" fieldId="part" [error]="errors.item" [required]="true">
            @if (inventoryItems().length > 0) {
              <select id="part" [(ngModel)]="partSelectValue" (ngModelChange)="onPartSelect($event)" name="partSelect">
                <option value="">Select from inventory...</option>
                @for (inv of inventoryItems(); track inv.id) {
                  <option [value]="inv.name">{{ inv.name }} ({{ inv.category }}) — {{ inv.qty }} {{ inv.unit }}</option>
                }
                <option value="__other__">Other (not in inventory)</option>
              </select>
              @if (partSelectValue === '__other__') {
                <input type="text" [(ngModel)]="form.item" name="customPart" placeholder="Type part name..."
                  maxlength="100" style="margin-top:6px; width:100%; padding:8px; border:1px solid var(--gray-border); border-radius:var(--radius-sm); font-size:var(--font-sm); box-sizing:border-box;" />
              }
            } @else {
              <input type="text" id="part" [(ngModel)]="form.item" name="item" placeholder="e.g. Motor Belt" maxlength="100" />
            }
          </app-form-field>
          <app-form-field label="Quantity" fieldId="qty" [error]="errors.qty" [required]="true">
            <input type="number" id="qty" [(ngModel)]="form.qty" name="qty" min="1" placeholder="1" />
          </app-form-field>
        </div>
        <app-form-field label="Related Task" fieldId="task" [error]="errors.machine" [required]="true">
          <select id="task" [(ngModel)]="form.machine" name="machine" [disabled]="activeTasks().length === 0">
            <option value="">{{ activeTasks().length ? 'Select Task' : 'No active tasks assigned' }}</option>
            @for (t of activeTasks(); track t.id) {
              <option [value]="t.machineId + ' – ' + t.machineName">{{ t.taskId || t.ticketCode }} – {{ t.machineName }}</option>
            }
          </select>
        </app-form-field>
        <app-form-field label="Priority" fieldId="priority">
          <select id="priority" [(ngModel)]="form.priority" name="priority">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </app-form-field>
        <div style="display:flex; gap:12px;">
          <app-button type="submit">Submit Request</app-button>
          <app-button type="button" variant="secondary" (clicked)="resetForm()">Reset</app-button>
        </div>
        @if (successMsg()) {
          <p style="color:var(--accent-green); margin-top:12px; font-weight:600;">{{ successMsg() }}</p>
        }
      </form>
    </app-card>

    <!-- Active requests -->
    <app-card>
      <h3 style="margin-bottom:16px;">Active Requests</h3>
      @if (activeRequests().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr><th>Request ID</th><th>Part</th><th>Qty</th><th>Machine</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              @for (r of activeRequests(); track r.id) {
                <tr>
                  <td><strong>{{ r.requestCode }}</strong></td>
                  <td>{{ r.item }}</td>
                  <td>{{ r.qty }}</td>
                  <td>{{ r.machine }}</td>
                  <td>{{ r.createdAt }}</td>
                  <td>
                    <span class="badge"
                      [class.badge--pending]="r.status === 'Pending'"
                      [class.badge--approved]="r.status === 'Approved' || r.status === 'ProcurementApproved'">{{ r.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No active requests</div>
          <div class="empty-state__msg">Submit a request using the form above.</div>
        </div>
      }
    </app-card>

    <!-- Resolved requests -->
    @if (resolvedRequests().length > 0) {
      <app-card>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0;">Resolved Requests</h3>
          <app-button variant="danger" size="sm" (clicked)="clearResolved()">Clear All</app-button>
        </div>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr><th>Request ID</th><th>Part</th><th>Qty</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              @for (r of resolvedRequests(); track r.id) {
                <tr>
                  <td><strong>{{ r.requestCode }}</strong></td>
                  <td>{{ r.item }}</td>
                  <td>{{ r.qty }}</td>
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
    .icon-btn {
      background: none; border: 1px solid var(--gray-border); border-radius: var(--radius-sm);
      padding: 3px 8px; cursor: pointer; color: var(--text-muted); font-size: var(--font-xs);
      transition: background var(--transition), color var(--transition);
    }
    .icon-btn:hover { background: #fee2e2; color: var(--accent-red); border-color: #fca5a5; }
  `]
})
export class SpareRequestsComponent implements OnInit {
  private spareApi   = inject(SpareRequestApiService);
  private ticketApi  = inject(MaintenanceTicketApiService);
  private invApi     = inject(InventoryApiService);
  private auth       = inject(AuthService);
  private confirm    = inject(ConfirmService);

  form       = { item: '', qty: 1, machine: '', priority: 'Medium' };
  errors     = { item: '', qty: '', machine: '' };
  successMsg    = signal('');
  requests      = signal<SpareRequestResponse[]>([]);
  activeTasks   = signal<MaintenanceTicketResponse[]>([]);
  inventoryItems = signal<InventoryItemResponse[]>([]);
  partSelectValue = '';

  activeRequests   = computed(() => this.requests().filter(r => r.status === 'Pending' || r.status === 'Approved' || r.status === 'ProcurementApproved'));
  resolvedRequests = computed(() => this.requests().filter(r => r.status === 'Fulfilled' || r.status === 'SentToExternal' || r.status === 'Rejected'));

  ngOnInit() {
    const empId = this.auth.currentUser()?.empId ?? '';
    const name  = this.auth.currentUser()?.name  ?? '';

    if (empId) {
      this.spareApi.getByUser(empId).subscribe({ next: list => this.requests.set(list) });
    }

    this.ticketApi.getAll().subscribe({
      next: list => this.activeTasks.set(
        list.filter(t => t.assignedTo === name && (t.status === 'Assigned' || t.status === 'In_Progress'))
      )
    });

    this.invApi.getAll().subscribe({
      next: list => this.inventoryItems.set([...list].sort((a, b) => a.name.localeCompare(b.name)))
    });
  }

  onPartSelect(value: string) {
    if (value === '__other__') {
      this.form.item = '';
    } else {
      this.form.item = value;
    }
    this.errors.item = '';
  }

  async submit(): Promise<void> {
    const itemClean = this.form.item.trim().replace(/<[^>]*>/g, '').slice(0, 100);
    this.errors.item    = !itemClean ? 'Part name is required.' :
                          itemClean.length < 2 ? 'Part name must be at least 2 characters.' : '';
    this.errors.machine = this.form.machine ? '' : 'Please select a task.';
    this.errors.qty     = this.form.qty > 0 ? '' : 'Quantity must be at least 1.';
    if (this.errors.item || this.errors.machine || this.errors.qty) return;

    if (!(await this.confirm.ask(`Submit request for "${itemClean}" (qty: ${this.form.qty})?`))) return;

    const empId = this.auth.currentUser()?.empId ?? '';
    this.spareApi.create({
      item: itemClean,
      qty: this.form.qty,
      machine: this.form.machine,
      priority: this.form.priority,
      requestedBy: empId,
    }).subscribe({
      next: (created) => {
        this.requests.update(list => [...list, created]);
        this.successMsg.set('Spare request submitted successfully.');
        this.resetForm();
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => this.errors.item = err?.error?.message ?? 'Failed to submit request',
    });
  }

  async deleteRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this spare request record?'))) return;
    this.spareApi.delete(id).subscribe({
      next: () => this.requests.update(list => list.filter(r => r.id !== id))
    });
  }

  async clearResolved(): Promise<void> {
    if (!(await this.confirm.ask('Clear all resolved requests? This cannot be undone.'))) return;
    this.spareApi.deleteCompleted().subscribe({
      next: () => this.requests.update(list => list.filter(r => r.status === 'Pending' || r.status === 'Approved' || r.status === 'ProcurementApproved'))
    });
  }

  resetForm() {
    this.form            = { item: '', qty: 1, machine: '', priority: 'Medium' };
    this.errors          = { item: '', qty: '', machine: '' };
    this.partSelectValue = '';
  }
}
