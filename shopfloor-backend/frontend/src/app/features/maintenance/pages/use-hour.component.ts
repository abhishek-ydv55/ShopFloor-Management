import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { MachineApiService, MachineResponse } from '../../../core/services/api/machine-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-use-hour',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, FormFieldComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Machine Use Hour</h2>
    <app-card>
      <form (ngSubmit)="save()" novalidate>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0 20px;">
          <app-form-field label="Machine" fieldId="machine" [error]="errors.machine" [required]="true">
            <select id="machine" [(ngModel)]="form.machineId" name="machineId" [disabled]="machines().length === 0" (change)="onMachineChange()">
              <option value="">{{ machines().length ? 'Select Machine' : 'No machines registered' }}</option>
              @for (m of machines(); track m.id) {
                <option [value]="m.id">{{ m.id }} – {{ m.name }}</option>
              }
            </select>
          </app-form-field>
          <app-form-field label="Use Hours (1–24)" fieldId="hours" [error]="errors.hours" [required]="true">
            <input type="number" id="hours" [(ngModel)]="form.hours" name="hours" min="1" max="24" placeholder="Hours" [disabled]="machineUnderMaintenance()" />
          </app-form-field>
          <app-form-field label="Date" fieldId="date" [error]="errors.date" [required]="true">
            <input type="date" id="date" [(ngModel)]="form.date" name="date" [max]="today" [min]="monthStart" [disabled]="machineUnderMaintenance()" />
          </app-form-field>
        </div>

        @if (selectedMachine()) {
          <div class="threshold-info">
            <span class="threshold-info__label">Hours used: <strong>{{ selectedMachine()!.hours }}h</strong></span>
            <span class="threshold-info__sep">/</span>
            <span class="threshold-info__label">Threshold: <strong>{{ selectedMachine()!.thresholdHours > 0 ? selectedMachine()!.thresholdHours + 'h' : 'Not set' }}</strong></span>
            @if (selectedMachine()!.thresholdHours > 0) {
              <span class="threshold-info__pct" [class.warn]="thresholdPct() >= 80" [class.danger]="thresholdPct() >= 100">{{ thresholdPct() }}%</span>
            }
          </div>
        }

        @if (machineUnderMaintenance()) {
          <div class="under-maintenance-notice">
            &#9888; This machine has crossed its usage threshold and is currently under maintenance. Usage hours cannot be logged until maintenance is completed.
          </div>
        }

        <div style="display:flex; gap:12px;">
          <app-button type="submit" [disabled]="machineUnderMaintenance()">Save</app-button>
          <app-button type="button" variant="secondary" (clicked)="reset()">Reset</app-button>
        </div>

        @if (successMsg()) {
          <p style="color:var(--accent-green); margin-top:12px; font-weight:600;">{{ successMsg() }}</p>
        }
        @if (maintenanceAlert()) {
          <div class="maintenance-alert">&#9888; {{ maintenanceAlert() }}</div>
        }
      </form>
    </app-card>

    @if (useHourLogs().length) {
      <app-card>
        <h3 style="margin-bottom:16px;">Use Hour Log</h3>
        <div style="overflow-x:auto;">
          <table>
            <thead><tr><th>Machine</th><th>Hours</th><th>Date</th></tr></thead>
            <tbody>
              @for (e of useHourLogs().slice().reverse(); track $index) {
                <tr><td>{{ e.machine }}</td><td>{{ e.hours }}h</td><td>{{ e.date }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    }
  `,
  styles: [`
    .threshold-info { display: flex; align-items: center; gap: 10px; margin: 8px 0 16px; font-size: var(--font-sm); color: var(--text-muted); }
    .threshold-info__sep { color: var(--gray-border); }
    .threshold-info__pct { font-weight: 700; padding: 2px 8px; border-radius: 12px; background: #d1fae5; color: #065f46; font-size: 0.75rem; }
    .threshold-info__pct.warn   { background: #fef3c7; color: #92400e; }
    .threshold-info__pct.danger { background: #fee2e2; color: #991b1b; }
    .maintenance-alert { margin-top: 12px; padding: 10px 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: var(--radius-md); color: #92400e; font-weight: 600; font-size: var(--font-sm); }
    .under-maintenance-notice { margin: 12px 0; padding: 12px 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: var(--radius-md); color: #991b1b; font-weight: 600; font-size: var(--font-sm); }
  `]
})
export class UseHourComponent implements OnInit {
  private api     = inject(MachineApiService);
  private confirm = inject(ConfirmService);

  readonly today      = new Date().toISOString().split('T')[0];
  readonly monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  machines         = signal<MachineResponse[]>([]);
  useHourLogs      = signal<any[]>([]);
  form             = { machineId: '', hours: null as number | null, date: '' };
  errors           = { machine: '', hours: '', date: '' };
  successMsg       = signal('');
  maintenanceAlert = signal('');
  selectedMachine  = signal<MachineResponse | null>(null);
  thresholdPct     = signal(0);
  machineUnderMaintenance = computed(() => this.selectedMachine()?.status === 'Maintenance');

  ngOnInit() {
    this.api.getAll().subscribe({ next: list => this.machines.set(list) });
    this.api.getUseHours().subscribe({ next: logs => this.useHourLogs.set(logs) });
  }

  onMachineChange() {
    const m = this.machines().find(x => x.id === this.form.machineId) ?? null;
    this.selectedMachine.set(m);
    this.updateThresholdPct(m);
  }

  private updateThresholdPct(m: MachineResponse | null) {
    if (!m || !m.thresholdHours) { this.thresholdPct.set(0); return; }
    this.thresholdPct.set(Math.min(100, Math.round((m.hours / m.thresholdHours) * 100)));
  }

  async save(): Promise<void> {
    if (this.machineUnderMaintenance()) return;
    let valid = true;
    this.errors.machine = this.form.machineId ? '' : 'Please select a machine.';
    if (!this.form.date) {
      this.errors.date = 'Please select a date.';
    } else if (this.form.date > this.today) {
      this.errors.date = 'Future dates are not allowed.';
    } else if (this.form.date < this.monthStart) {
      this.errors.date = 'Only dates within the current month are allowed.';
    } else {
      this.errors.date = '';
    }
    if (!this.form.hours) { this.errors.hours = 'Please enter use hours.'; valid = false; }
    else if (this.form.hours < 1 || this.form.hours > 24) { this.errors.hours = 'Use hours must be between 1 and 24.'; valid = false; }
    else this.errors.hours = '';
    if (this.errors.machine || this.errors.date) valid = false;
    if (!valid) return;
    if (!(await this.confirm.ask(`Log ${this.form.hours}h for machine ${this.form.machineId} on ${this.form.date}?`))) return;

    this.api.logHours(this.form.machineId, this.form.hours!, this.form.date).subscribe({
      next: (result) => {
        this.successMsg.set(`Machine ${this.form.machineId} usage of ${this.form.hours} hours saved for ${this.form.date}.`);
        this.maintenanceAlert.set('');

        // Refresh machine list to get updated hours/status
        this.api.getAll().subscribe({ next: list => {
          this.machines.set(list);
          const updated = list.find(m => m.id === this.form.machineId) ?? null;
          this.selectedMachine.set(updated);
          if (updated && updated.status === 'Maintenance') {
            this.maintenanceAlert.set(
              `Machine ${this.form.machineId} has reached its usage threshold and has been automatically marked for Maintenance.`
            );
          }
        }});

        this.api.getUseHours().subscribe({ next: logs => this.useHourLogs.set(logs) });
        this.reset();
        setTimeout(() => { this.successMsg.set(''); this.maintenanceAlert.set(''); }, 6000);
      },
      error: (err) => {
        this.errors.machine = err?.error?.message ?? 'Failed to save hours';
      }
    });
  }

  reset() {
    this.form = { machineId: '', hours: null, date: '' };
    this.errors = { machine: '', hours: '', date: '' };
    this.selectedMachine.set(null);
    this.thresholdPct.set(0);
  }
}
