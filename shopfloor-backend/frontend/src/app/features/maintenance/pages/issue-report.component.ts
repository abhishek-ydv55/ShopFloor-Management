import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { MachineApiService, MachineResponse } from '../../../core/services/api/machine-api.service';
import { MaintenanceIssueApiService } from '../../../core/services/api/maintenance-issue-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-issue-report',
  standalone: true,
  imports: [FormsModule, CardComponent, FormFieldComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Report Maintenance Issue</h2>
    <app-card>
      <form (ngSubmit)="submit()" novalidate>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0 20px;">
          <app-form-field label="Machine" fieldId="machine" [error]="errors.machine" [required]="true">
            <select id="machine" [(ngModel)]="form.machine" name="machine" [disabled]="machines().length === 0">
              <option value="">{{ machines().length ? 'Select Machine' : 'No machines registered' }}</option>
              @for (m of machines(); track m.id) {
                <option [value]="m.id">{{ m.id }} – {{ m.name }}</option>
              }
            </select>
          </app-form-field>

          <app-form-field label="Issue Type" fieldId="issueType" [error]="errors.type" [required]="true">
            <select id="issueType" [(ngModel)]="form.type" name="type">
              <option value="">Select Issue Type</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Preventive">Preventive</option>
              <option value="Inspection">Inspection</option>
            </select>
          </app-form-field>

          <app-form-field label="Severity" fieldId="severity" [error]="errors.severity" [required]="true">
            <select id="severity" [(ngModel)]="form.severity" name="severity">
              <option value="">Select Severity</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </app-form-field>

          <app-form-field label="Date" fieldId="date" [error]="errors.date" [required]="true">
            <input type="date" id="date" [(ngModel)]="form.date" name="date" [max]="today" />
          </app-form-field>
        </div>

        <app-form-field label="Issue Description" fieldId="desc" [error]="errors.description" [required]="true">
          <textarea id="desc" [(ngModel)]="form.description" name="description" rows="4"
            placeholder="Describe the issue..." maxlength="500"></textarea>
        </app-form-field>

        @if (form.machine) {
          <div class="maintenance-escalation-notice">
            &#9888;&nbsp;<strong>Note:</strong>
            Submitting this report will automatically mark machine <strong>{{ form.machine }}</strong> as
            <strong>Under Maintenance</strong> and create a task for the manager to assign a technician.
          </div>
        }

        <div style="display:flex; gap:12px; margin-top:12px;">
          <app-button type="submit">Submit Report</app-button>
          <app-button type="button" variant="secondary" (clicked)="reset()">Reset</app-button>
        </div>
        @if (successMsg()) {
          <p style="color:var(--accent-green); margin-top:12px; font-weight:600;">{{ successMsg() }}</p>
        }
      </form>
    </app-card>
  `,
  styles: [`
    .maintenance-escalation-notice {
      margin-top: 14px;
      padding: 12px 16px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: var(--radius-md);
      color: #92400e;
      font-size: var(--font-sm);
      line-height: 1.5;
    }
  `]
})
export class IssueReportComponent implements OnInit {
  private machineApi = inject(MachineApiService);
  private issueApi   = inject(MaintenanceIssueApiService);
  private auth       = inject(AuthService);
  private confirm    = inject(ConfirmService);

  readonly today = new Date().toISOString().split('T')[0];
  machines   = signal<MachineResponse[]>([]);
  form       = { machine: '', type: '', description: '', severity: '', date: '' };
  errors     = { machine: '', type: '', description: '', severity: '', date: '' };
  successMsg = signal('');

  ngOnInit() {
    this.machineApi.getAll().subscribe({ next: list => this.machines.set(list) });
  }

  async submit(): Promise<void> {
    let valid = true;
    const keys = ['machine', 'type', 'description', 'severity', 'date'] as const;
    keys.forEach(k => {
      this.errors[k] = this.form[k].trim() ? '' : `Please ${k === 'machine' ? 'select a machine' : k === 'type' ? 'select an issue type' : k === 'severity' ? 'select severity' : k === 'date' ? 'select a date' : 'enter a description'}.`;
      if (this.errors[k]) valid = false;
    });
    if (!valid) return;
    const descClean = this.form.description.trim().replace(/<[^>]*>/g, '').slice(0, 500);
    if (descClean.length < 5) { this.errors.description = 'Description must be at least 5 characters.'; return; }

    if (!(await this.confirm.ask(
      `Submit issue report for machine "${this.form.machine}"?\n\nThis will mark the machine as Under Maintenance and notify the manager.`
    ))) return;

    const empId = this.auth.currentUser()?.empId ?? '';
    this.issueApi.create({ ...this.form, description: descClean, reportedBy: empId }).subscribe({
      next: () => {
        this.successMsg.set('Issue reported. Machine marked for maintenance — manager has been notified.');
        this.reset();
        setTimeout(() => this.successMsg.set(''), 5000);
      },
      error: (err) => this.errors.description = err?.error?.message ?? 'Failed to report issue',
    });
  }

  reset() {
    this.form   = { machine: '', type: '', description: '', severity: '', date: '' };
    this.errors = { machine: '', type: '', description: '', severity: '', date: '' };
  }
}
