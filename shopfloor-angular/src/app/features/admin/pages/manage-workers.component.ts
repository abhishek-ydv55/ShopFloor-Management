import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { WorkerApiService, WorkerResponse } from '../../../core/services/api/worker-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

interface WorkerForm {
  empId: string; name: string; role: string; email: string; password: string;
}
interface FormErrors {
  empId: string; name: string; role: string; email: string; password: string;
}

const ROLES = [
  'Admin', 'Manager', 'Supervisor', 'Technician',
  'Maintenance Manager', 'Maintenance Supervisor', 'Procurement', 'Inventory',
];

function getPrefixForRole(role: string): string {
  switch (role) {
    case 'Procurement':            return 'PROC';
    case 'Maintenance Manager':
    case 'Maintenance Supervisor': return 'MAIN';
    case 'Admin':                  return 'ADM';
    case 'Manager':                return 'MGR';
    case 'Supervisor':             return 'SUP';
    case 'Technician':             return 'TECH';
    case 'Inventory':              return 'INV';
    default:                       return 'EMP';
  }
}

function generateEmpIdForRole(role: string): string {
  const prefix = getPrefixForRole(role);
  const digits = String(Math.floor(Math.random() * 900000 + 100000));
  return `${prefix}-${digits}`;
}

function generateDefaultEmpId(): string {
  const digits = String(Math.floor(Math.random() * 900000 + 100000));
  return `EMP-${digits}`;
}

@Component({
  selector: 'app-manage-workers',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, FormFieldComponent, ModalComponent],
  template: `
    <div class="page-header">
      <h2 class="page-title">Manage Workers</h2>
      <app-button variant="primary" (clicked)="openAdd()">+ Add Worker</app-button>
    </div>

    <!-- Stats -->
    <div class="cards-grid" style="margin-bottom: var(--space-6);">
      <app-card variant="stat">
        <span>Total Workers</span>
        <h3>{{ workers().length }}</h3>
      </app-card>
      @for (role of roleStats(); track role.label) {
        <app-card variant="stat">
          <span>{{ role.label }}</span>
          <h3>{{ role.count }}</h3>
        </app-card>
      }
    </div>

    <!-- Workers Table -->
    <app-card>
      @if (apiError()) {
        <p style="color:var(--accent-red); font-weight:600;">{{ apiError() }}</p>
      }
      <div style="margin-bottom: var(--space-4);">
        <input
          type="text"
          [ngModel]="searchText()"
          (ngModelChange)="searchText.set($event)"
          placeholder="Search by ID, name, role or email..."
          style="width:100%; padding:10px 14px; border:1px solid var(--gray-border); border-radius:var(--radius-md); font-size:var(--font-sm); box-sizing:border-box;"
        />
      </div>
      @if (workers().length === 0) {
        <p style="color:var(--text-muted); text-align:center; padding: var(--space-6) 0;">
          No workers registered yet. Click <strong>+ Add Worker</strong> to get started.
        </p>
      } @else {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Emp ID</th><th>Name</th><th>Role</th><th>Email</th><th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredWorkers().length === 0) {
                <tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">No workers match your search.</td></tr>
              }
              @for (w of filteredWorkers(); track w.empId) {
                <tr>
                  <td><span class="emp-id-badge">{{ w.empId }}</span></td>
                  <td>{{ w.name }}</td>
                  <td><span class="role-badge">{{ w.role }}</span></td>
                  <td>{{ w.email }}</td>
                  <td style="text-align:center;">
                    <div style="display:flex; gap:8px; justify-content:center;">
                      <app-button variant="secondary" size="sm" (clicked)="openEdit(w)">Edit</app-button>
                      <app-button variant="danger" size="sm" (clicked)="deleteWorker(w.empId, w.name)">Delete</app-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </app-card>

    <!-- Add / Edit Modal -->
    <app-modal
      [open]="modalOpen()"
      [title]="isEditing() ? 'Edit Worker' : 'Add Worker'"
      (closed)="closeModal()"
    >
      <form (ngSubmit)="submitForm()" novalidate>
        <div class="form-grid">
          <app-form-field label="Role" fieldId="wRole" [error]="formErrors().role" [required]="true">
            <select id="wRole" [ngModel]="formData().role" (ngModelChange)="onRoleChange($event)" name="wRole">
              <option value="">Select Role</option>
              @for (r of roles; track r) {
                <option [value]="r">{{ r }}</option>
              }
            </select>
          </app-form-field>

          <app-form-field label="Employee ID" fieldId="wEmpId" [error]="formErrors().empId" [required]="true">
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="wEmpId" [ngModel]="formData().empId" (ngModelChange)="updateField('empId', $event)" name="wEmpId" placeholder="Select a role to auto-generate" style="flex:1;" />
              @if (!isEditing()) {
                <button type="button" class="regen-btn" (click)="regenerateEmpId()" title="Regenerate ID">&#8635;</button>
              }
            </div>
          </app-form-field>

          <app-form-field label="Full Name" fieldId="wName" [error]="formErrors().name" [required]="true">
            <input type="text" id="wName" [ngModel]="formData().name" (ngModelChange)="updateField('name', $event)" name="wName" placeholder="e.g. Ravi Kumar" />
          </app-form-field>

          <app-form-field label="Email (used for login)" fieldId="wEmail" [error]="formErrors().email" [required]="true">
            <input type="email" id="wEmail" [ngModel]="formData().email" (ngModelChange)="updateField('email', $event)" name="wEmail" placeholder="e.g. ravi@company.com" />
          </app-form-field>

          <app-form-field
            label="{{ isEditing() ? 'New Password (leave blank to keep)' : 'Password' }}"
            fieldId="wPass" [error]="formErrors().password" [required]="!isEditing()" style="grid-column: 1 / -1;"
          >
            <input type="password" id="wPass" [ngModel]="formData().password" (ngModelChange)="updateField('password', $event)" name="wPass" placeholder="{{ isEditing() ? 'Leave blank to keep current password' : 'e.g. Secret@1' }}" />
          </app-form-field>
        </div>

        @if (formSubmitError()) {
          <p style="color:var(--accent-red); margin-top:8px; font-size:var(--font-sm);">{{ formSubmitError() }}</p>
        }

        <div class="form-actions">
          <app-button variant="secondary" type="button" (clicked)="closeModal()">Cancel</app-button>
          <app-button variant="primary" type="submit">
            {{ isEditing() ? 'Save Changes' : 'Add Worker' }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .page-header .page-title { margin-bottom: 0; }
    .emp-id-badge { font-family: monospace; font-size: var(--font-xs); font-weight: 700; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: var(--text-dark); }
    .role-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; background: #dbeafe; color: #1e40af; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: var(--space-2); }
    .regen-btn { background: var(--primary, var(--red-700)); color: #fff; border: none; border-radius: var(--radius-md); width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .regen-btn:hover { opacity: 0.85; }
  `]
})
export class ManageWorkersComponent implements OnInit {
  private api     = inject(WorkerApiService);
  private confirm = inject(ConfirmService);

  workers       = signal<WorkerResponse[]>([]);
  searchText    = signal('');
  modalOpen     = signal(false);
  isEditing     = signal(false);
  apiError      = signal('');
  formSubmitError = signal('');
  roles = ROLES;

  private emptyForm   = (): WorkerForm   => ({ empId: '', name: '', role: '', email: '', password: '' });
  private emptyErrors = (): FormErrors   => ({ empId: '', name: '', role: '', email: '', password: '' });

  formData   = signal<WorkerForm>(this.emptyForm());
  formErrors = signal<FormErrors>(this.emptyErrors());

  filteredWorkers = computed(() => {
    const q = this.searchText().toLowerCase().trim();
    if (!q) return this.workers();
    return this.workers().filter(w =>
      w.empId.toLowerCase().includes(q) ||
      w.name.toLowerCase().includes(q)  ||
      w.role.toLowerCase().includes(q)  ||
      w.email.toLowerCase().includes(q)
    );
  });

  roleStats = computed(() => {
    const counts: Record<string, number> = {};
    for (const w of this.workers()) {
      counts[w.role] = (counts[w.role] ?? 0) + 1;
    }
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.api.getAll().subscribe({
      next: list => this.workers.set(list),
      error: () => this.apiError.set('Failed to load workers'),
    });
  }

  updateField(field: keyof WorkerForm, value: string) {
    this.formData.update(f => ({ ...f, [field]: value }));
    this.formErrors.update(e => ({ ...e, [field]: '' }));
  }

  onRoleChange(role: string) {
    this.formData.update(f => ({ ...f, role }));
    this.formErrors.update(e => ({ ...e, role: '' }));
    if (!this.isEditing() && role) {
      this.formData.update(f => ({ ...f, empId: generateEmpIdForRole(role) }));
      this.formErrors.update(e => ({ ...e, empId: '' }));
    }
  }

  regenerateEmpId() {
    const role = this.formData().role;
    this.formData.update(f => ({ ...f, empId: role ? generateEmpIdForRole(role) : generateDefaultEmpId() }));
    this.formErrors.update(e => ({ ...e, empId: '' }));
  }

  openAdd() {
    this.isEditing.set(false);
    this.formData.set(this.emptyForm());
    this.formErrors.set(this.emptyErrors());
    this.formSubmitError.set('');
    this.modalOpen.set(true);
  }

  openEdit(w: WorkerResponse) {
    this.isEditing.set(true);
    this.formData.set({ empId: w.empId, name: w.name, role: w.role, email: w.email, password: '' });
    this.formErrors.set(this.emptyErrors());
    this.formSubmitError.set('');
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  private readonly pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,15}$/;

  private validate(): boolean {
    const f = this.formData();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: FormErrors = {
      empId:    !f.empId.trim()    ? 'Employee ID is required.' : '',
      name:     !f.name.trim()     ? 'Name is required.' : f.name.trim().length < 3 ? 'Name must be at least 3 characters.' : '',
      role:     !f.role            ? 'Please select a role.' : '',
      email:    !f.email.trim()    ? 'Email is required.' : !emailRe.test(f.email.trim()) ? 'Enter a valid email.' : '',
      password: !this.isEditing() && !f.password
                  ? 'Password is required.'
                  : f.password && !this.pwdPattern.test(f.password)
                    ? 'Password must be 6-15 chars with uppercase, lowercase, digit, and special char (@$!%*?&#).'
                    : '',
    };
    this.formErrors.set(errors);
    return !Object.values(errors).some(Boolean);
  }

  async submitForm(): Promise<void> {
    if (!this.validate()) return;
    const f = this.formData();
    this.formSubmitError.set('');

    if (this.isEditing()) {
      if (!(await this.confirm.ask(`Save changes to worker "${f.name}"?`))) return;
      const body: any = { name: f.name, role: f.role, email: f.email };
      if (f.password) body.password = f.password;
      this.api.update(f.empId, body).subscribe({
        next: (updated) => {
          this.workers.update(list => list.map(w => w.empId === f.empId ? updated : w));
          this.closeModal();
        },
        error: (err) => this.formSubmitError.set(err?.error?.message ?? 'Failed to update worker'),
      });
    } else {
      if (!(await this.confirm.ask(`Add worker "${f.name.trim()}" with role "${f.role}"?`))) return;
      this.api.create({ empId: f.empId.trim(), name: f.name.trim(), role: f.role, email: f.email.trim().toLowerCase(), password: f.password }).subscribe({
        next: (created) => {
          this.workers.update(list => [...list, created]);
          this.closeModal();
        },
        error: (err) => this.formSubmitError.set(err?.error?.message ?? 'Failed to create worker'),
      });
    }
  }

  async deleteWorker(empId: string, name: string): Promise<void> {
    if (!(await this.confirm.ask(`Remove worker "${name}"? This cannot be undone.`))) return;
    this.api.delete(empId).subscribe({
      next: () => this.workers.update(list => list.filter(w => w.empId !== empId)),
      error: (err) => this.apiError.set(err?.error?.message ?? 'Failed to delete worker'),
    });
  }
}
