import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { MachineApiService, MachineResponse } from '../../../core/services/api/machine-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

interface MachineForm {
  id: string; name: string; status: 'Active' | 'Maintenance' | 'Inactive';
  thresholdHours: number; location: string;
}
interface FormErrors { id: string; name: string; thresholdHours: string; location: string; }

function sanitize(s: string, maxLen = 100): string {
  return s.trim().replace(/<[^>]*>/g, '').slice(0, maxLen);
}

@Component({
  selector: 'app-manage-machines',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, FormFieldComponent, ModalComponent],
  template: `
    <div class="page-header">
      <h2 class="page-title">Manage Machines</h2>
      <app-button variant="primary" (clicked)="openAdd()">+ Add Machine</app-button>
    </div>

    <div class="cards-grid" style="margin-bottom: var(--space-6);">
      <app-card variant="stat"><span>Total Machines</span><h3>{{ machines().length }}</h3></app-card>
      <app-card variant="stat"><span>Active</span><h3 style="color: var(--accent-green);">{{ stats().active }}</h3></app-card>
      <app-card variant="stat"><span>Maintenance</span><h3 style="color: #f59e0b;">{{ stats().maintenance }}</h3></app-card>
      <app-card variant="stat"><span>Inactive</span><h3 style="color: var(--text-muted);">{{ stats().inactive }}</h3></app-card>
    </div>

    @if (apiError()) {
      <p style="color:var(--accent-red); font-weight:600; margin-bottom:12px;">{{ apiError() }}</p>
    }

    <div class="machine-grid">
      @for (m of machines(); track m.id) {
        <div class="machine-card" [class.active]="m.status === 'Active'" [class.maintenance]="m.status === 'Maintenance'" [class.inactive]="m.status === 'Inactive'">
          <div class="machine-card__header">
            <span class="machine-id">{{ m.id }}</span>
            <span class="badge" [class.badge--approved]="m.status === 'Active'" [class.badge--pending]="m.status === 'Maintenance'" [class.badge--closed]="m.status === 'Inactive'">{{ m.status }}</span>
          </div>
          <h4 class="machine-name">{{ m.name }}</h4>
          <div class="machine-meta">
            <span class="meta-item">
              <span class="meta-icon">&#8987;</span>
              {{ m.hours }}h used
              @if (m.thresholdHours > 0) {
                <span class="threshold-label">/ {{ m.thresholdHours }}h threshold</span>
              }
            </span>
            @if (m.thresholdHours > 0) {
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" [style.width.%]="usagePct(m)" [class.progress-bar-fill--warn]="usagePct(m) >= 80" [class.progress-bar-fill--danger]="usagePct(m) >= 100"></div>
              </div>
            }
            <span class="meta-item"><span class="meta-icon">&#128205;</span> {{ m.location }}</span>
          </div>
          <div class="machine-actions">
            <app-button variant="secondary" size="sm" (clicked)="openEdit(m)">Edit</app-button>
            <app-button variant="danger" size="sm" (clicked)="deleteMachine(m.id, m.name)">Delete</app-button>
          </div>
        </div>
      }
    </div>

    <app-modal [open]="modalOpen()" [title]="isEditing() ? 'Edit Machine' : 'Add Machine'" (closed)="closeModal()">
      <form (ngSubmit)="submitForm()" novalidate>
        <div class="form-grid">
          <app-form-field label="Machine Name" fieldId="mName" [error]="formErrors().name" [required]="true">
            <input type="text" id="mName" [ngModel]="formData().name" (ngModelChange)="onNameChange($event)" name="mName" placeholder="e.g. Filling Machine" maxlength="50" pattern="[A-Za-z\s]+" />
          </app-form-field>
          <app-form-field label="Machine ID" fieldId="mId" [error]="formErrors().id" [required]="true">
            <div style="display:flex; gap:6px; align-items:center;">
              <input type="text" id="mId" [ngModel]="formData().id" (ngModelChange)="onIdChange($event)" name="mId" [disabled]="isEditing()" placeholder="e.g. FM-101" style="flex:1; text-transform:uppercase;" maxlength="8" />
              @if (!isEditing()) {
                <button type="button" class="regen-btn" (click)="regenerateId()" title="Generate new ID">&#8635;</button>
              }
            </div>
            @if (!isEditing()) {
              <small class="field-hint">Auto-filled from name &middot; Format: XX-NNN</small>
            }
          </app-form-field>
          <app-form-field label="Status" fieldId="mStatus" [required]="true">
            <select id="mStatus" [ngModel]="formData().status" (ngModelChange)="updateField('status', $event)" name="mStatus">
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </app-form-field>
          <app-form-field label="Threshold Hours" fieldId="mThreshold" [error]="formErrors().thresholdHours" [required]="true">
            <input type="number" id="mThreshold" [ngModel]="formData().thresholdHours" (ngModelChange)="updateField('thresholdHours', +$event)" name="mThreshold" min="1" placeholder="e.g. 1000" />
          </app-form-field>
          @if (isEditing()) {
            <app-form-field label="Hours Used (read-only)" fieldId="mHours">
              <input type="number" id="mHours" [ngModel]="editingHours()" name="mHours" disabled />
            </app-form-field>
          }
          <app-form-field label="Location" fieldId="mLocation" [error]="formErrors().location" [required]="true" style="grid-column: 1 / -1;">
            <input type="text" id="mLocation" [ngModel]="formData().location" (ngModelChange)="updateField('location', $event)" name="mLocation" placeholder="e.g. Assembly" />
          </app-form-field>
        </div>
        @if (formError()) {
          <p style="color:var(--accent-red); font-size:var(--font-sm); margin-top:8px;">{{ formError() }}</p>
        }
        <div class="form-actions">
          <app-button variant="secondary" type="button" (clicked)="closeModal()">Cancel</app-button>
          <app-button variant="primary" type="submit">{{ isEditing() ? 'Save Changes' : 'Add Machine' }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .page-header .page-title { margin-bottom: 0; }
    .machine-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .machine-card { background: var(--white); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-md); border-top: 4px solid var(--gray-border); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; gap: var(--space-3); }
    .machine-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .machine-card.active { border-top-color: var(--accent-green); }
    .machine-card.maintenance { border-top-color: #f59e0b; }
    .machine-card.inactive { border-top-color: var(--text-muted); }
    .machine-card__header { display: flex; justify-content: space-between; align-items: center; }
    .machine-id { font-size: var(--font-xs); font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; }
    .machine-name { font-size: var(--font-base); font-weight: 600; color: var(--text-dark); margin: 0; line-height: 1.3; }
    .machine-meta { display: flex; flex-direction: column; gap: var(--space-1); }
    .meta-item { font-size: var(--font-xs); color: var(--text-muted); display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap; }
    .threshold-label { color: #6b7280; font-size: 0.7rem; }
    .meta-icon { font-style: normal; }
    .progress-bar-wrap { background: #e5e7eb; border-radius: 4px; height: 5px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: var(--accent-green); border-radius: 4px; transition: width 0.3s; }
    .progress-bar-fill--warn { background: #f59e0b; }
    .progress-bar-fill--danger { background: #ef4444; }
    .machine-actions { display: flex; gap: var(--space-2); margin-top: var(--space-1); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: var(--space-2); }
    .regen-btn { background: var(--gray-light); border: 1px solid var(--gray-border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 16px; color: var(--text-muted); transition: background var(--transition); flex-shrink: 0; }
    .regen-btn:hover { background: var(--gray-border); color: var(--text-dark); }
    .field-hint { display: block; font-size: 0.68rem; color: var(--text-muted); margin-top: 3px; }
  `]
})
export class ManageMachinesComponent implements OnInit {
  private api     = inject(MachineApiService);
  private confirm = inject(ConfirmService);

  machines     = signal<MachineResponse[]>([]);
  apiError     = signal('');
  formError    = signal('');
  modalOpen    = signal(false);
  isEditing    = signal(false);
  editingHours = signal<number>(0);
  private lastGeneratedId = '';

  stats = computed(() => ({
    active:      this.machines().filter(m => m.status === 'Active').length,
    maintenance: this.machines().filter(m => m.status === 'Maintenance').length,
    inactive:    this.machines().filter(m => m.status === 'Inactive').length,
  }));

  private emptyForm   = (): MachineForm   => ({ id: '', name: '', status: 'Active', thresholdHours: 0, location: '' });
  private emptyErrors = (): FormErrors    => ({ id: '', name: '', thresholdHours: '', location: '' });
  formData   = signal<MachineForm>(this.emptyForm());
  formErrors = signal<FormErrors>(this.emptyErrors());

  ngOnInit() { this.load(); }

  private load() {
    this.api.getAll().subscribe({
      next: list => this.machines.set(list),
      error: () => this.apiError.set('Failed to load machines'),
    });
  }

  usagePct(m: MachineResponse): number {
    if (!m.thresholdHours) return 0;
    return Math.min(100, Math.round((m.hours / m.thresholdHours) * 100));
  }

  updateField(field: keyof MachineForm, value: string | number) {
    this.formData.update(f => ({ ...f, [field]: value }));
    if (field in this.emptyErrors()) this.formErrors.update(e => ({ ...e, [field]: '' }));
  }

  onNameChange(value: string) {
    this.updateField('name', value);
    if (!this.isEditing()) {
      const letters = value.replace(/[^A-Za-z]/g, '');
      if (letters.length >= 2 && (!this.formData().id || this.formData().id === this.lastGeneratedId)) {
        this.regenerateId();
      } else if (letters.length < 2 && this.formData().id === this.lastGeneratedId) {
        this.lastGeneratedId = '';
        this.updateField('id', '');
      }
    }
  }

  onIdChange(value: string) {
    const upper = value.toUpperCase();
    this.updateField('id', upper);
    if (upper !== this.lastGeneratedId) this.lastGeneratedId = '';
  }

  regenerateId() {
    const letters = this.formData().name.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 2) {
      const prefix = letters.slice(0, 2).toUpperCase();
      const num = Math.floor(100 + Math.random() * 900);
      this.lastGeneratedId = `${prefix}-${num}`;
      this.updateField('id', this.lastGeneratedId);
    }
  }

  openAdd() {
    this.isEditing.set(false);
    this.lastGeneratedId = '';
    this.formData.set(this.emptyForm());
    this.formErrors.set(this.emptyErrors());
    this.formError.set('');
    this.modalOpen.set(true);
  }

  openEdit(m: MachineResponse) {
    this.isEditing.set(true);
    this.editingHours.set(m.hours);
    this.formData.set({ id: m.id, name: m.name, status: m.status as any, thresholdHours: m.thresholdHours, location: m.location });
    this.formErrors.set(this.emptyErrors());
    this.formError.set('');
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  private readonly ID_PATTERN   = /^[A-Z]{2}-\d{3,4}$/;
  private readonly NAME_PATTERN = /^[A-Za-z\s]+$/;

  private validate(): boolean {
    const f  = this.formData();
    const id = f.id.trim().toUpperCase();
    const errors: FormErrors = {
      id: this.isEditing() ? '' :
          !id ? 'Machine ID is required.' :
          !this.ID_PATTERN.test(id) ? 'ID must match format XX-NNN (e.g. FM-101).' :
          this.machines().some(m => m.id.toUpperCase() === id) ? `Machine ID "${id}" is already in use.` : '',
      name: !f.name.trim() ? 'Machine name is required.' :
            !this.NAME_PATTERN.test(f.name.trim()) ? 'Name can only contain letters and spaces.' :
            f.name.trim().length < 3 ? 'Name must be at least 3 characters.' :
            f.name.trim().length > 50 ? 'Name cannot exceed 50 characters.' : '',
      thresholdHours: f.thresholdHours < 1 ? 'Threshold hours must be at least 1.' : '',
      location: !f.location.trim() ? 'Location is required.' :
                f.location.trim().length > 50 ? 'Location cannot exceed 50 characters.' : '',
    };
    this.formErrors.set(errors);
    return !Object.values(errors).some(Boolean);
  }

  async submitForm(): Promise<void> {
    if (!this.validate()) return;
    const f = this.formData();
    const name     = sanitize(f.name, 50);
    const location = sanitize(f.location, 50);
    const id       = f.id.trim().toUpperCase();
    this.formError.set('');

    if (this.isEditing()) {
      if (!(await this.confirm.ask(`Save changes to machine "${name}"?`))) return;
      this.api.update(f.id, { name, status: f.status, thresholdHours: f.thresholdHours, location }).subscribe({
        next: updated => { this.machines.update(list => list.map(m => m.id === f.id ? updated : m)); this.closeModal(); },
        error: err => this.formError.set(err?.error?.message ?? 'Failed to update machine'),
      });
    } else {
      if (!(await this.confirm.ask(`Add machine "${name}" (${id})?`))) return;
      this.api.create({ id, name, status: f.status, thresholdHours: f.thresholdHours, location }).subscribe({
        next: created => { this.machines.update(list => [...list, created]); this.closeModal(); },
        error: err => this.formError.set(err?.error?.message ?? 'Failed to create machine'),
      });
    }
  }

  async deleteMachine(id: string, name: string): Promise<void> {
    if (!(await this.confirm.ask(`Delete machine "${name}" (${id})? This cannot be undone.`))) return;
    this.api.delete(id).subscribe({
      next: () => this.machines.update(list => list.filter(m => m.id !== id)),
      error: err => this.apiError.set(err?.error?.message ?? 'Failed to delete machine'),
    });
  }
}
