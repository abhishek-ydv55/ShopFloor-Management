import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { TicketApiService, TicketResponse } from '../../../core/services/api/ticket-api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

const DEPT_ISSUE_TYPES: Record<string, string[]> = {
  Maintenance:  ['Electrical', 'Mechanical', 'Hydraulic', 'Breakdown', 'Preventive', 'Inspection'],
  Inventory:    ['Stock Refill', 'Damage Report', 'Stock Check', 'Item Mismatch', 'Excess Stock'],
  Procurement:  ['Purchase Order', 'Vendor Issue', 'Budget Request', 'Supply Delay', 'Contract Review', 'Invoice Dispute'],
};

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, FormFieldComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Create Ticket</h2>
    <app-card>
      <form (ngSubmit)="onSubmit()" novalidate>
        <div class="form-grid">
          <app-form-field label="Department" fieldId="dept" [error]="errors.department" [required]="true">
            <select id="dept" [(ngModel)]="form.department" name="department" (change)="onDeptChange()">
              <option value="">Select Department</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Procurement">Procurement</option>
              <option value="Inventory">Inventory</option>
            </select>
          </app-form-field>

          <app-form-field label="Priority" fieldId="priority" [error]="errors.priority" [required]="true">
            <select id="priority" [(ngModel)]="form.priority" name="priority">
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </app-form-field>

          <app-form-field label="Issue Type" fieldId="issueType">
            <select id="issueType" [(ngModel)]="form.issueType" name="issueType" [disabled]="!issueTypes.length">
              <option value="">Select Issue Type</option>
              @for (t of issueTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </app-form-field>
        </div>

        <app-form-field label="Description" fieldId="desc" [error]="errors.description" [required]="true">
          <textarea id="desc" [(ngModel)]="form.description" name="description" rows="4" placeholder="Describe the issue in detail..." maxlength="500"></textarea>
        </app-form-field>

        <div style="display:flex; gap:12px; margin-top:8px;">
          <app-button type="submit">Create Ticket</app-button>
          <app-button type="button" variant="secondary" (clicked)="reset()">Reset</app-button>
        </div>
      </form>

      @if (createdTicket()) {
        <app-card style="margin-top:20px; border:2px solid var(--accent-green);">
          <h4 style="color:var(--accent-green); margin-bottom:8px;">Ticket Created Successfully</h4>
          <p style="font-size:var(--font-sm);"><strong>ID:</strong> {{ createdTicket()!.id }}</p>
          <p style="font-size:var(--font-sm);"><strong>Department:</strong> {{ createdTicket()!.currentDepartment }}</p>
          <p style="font-size:var(--font-sm);"><strong>Priority:</strong> {{ createdTicket()!.priority }}</p>
        </app-card>
      }
    </app-card>
  `,
  styles: [`.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 20px; } @media(max-width:600px){.form-grid{grid-template-columns:1fr;}}`]
})
export class CreateTicketComponent {
  private api     = inject(TicketApiService);
  private confirm = inject(ConfirmService);

  form   = { department: '', priority: '', issueType: '', description: '' };
  errors = { department: '', priority: '', description: '' };
  issueTypes: string[] = [];
  createdTicket = signal<TicketResponse | null>(null);

  onDeptChange() {
    this.issueTypes = DEPT_ISSUE_TYPES[this.form.department] ?? [];
    this.form.issueType = '';
  }

  async onSubmit(): Promise<void> {
    let valid = true;
    if (!this.form.department)       { this.errors.department   = 'Department is required.'; valid = false; } else this.errors.department = '';
    if (!this.form.priority)         { this.errors.priority     = 'Priority is required.';   valid = false; } else this.errors.priority = '';
    const desc = this.form.description.trim().replace(/<[^>]*>/g, '');
    if (!desc)              { this.errors.description = 'Description is required.'; valid = false; }
    else if (desc.length > 500) { this.errors.description = 'Description cannot exceed 500 characters.'; valid = false; }
    else this.errors.description = '';
    if (!valid) return;
    if (!(await this.confirm.ask(`Create a ${this.form.priority} priority ticket for the ${this.form.department} department?`))) return;

    this.api.create({
      priority: this.form.priority,
      department: this.form.department,
      description: desc,
    }).subscribe({
      next: (ticket) => {
        this.createdTicket.set(ticket);
        this.reset();
      },
      error: (err) => this.errors.description = err?.error?.message ?? 'Failed to create ticket',
    });
  }

  reset() {
    this.form   = { department: '', priority: '', issueType: '', description: '' };
    this.errors = { department: '', priority: '', description: '' };
    this.issueTypes = [];
  }
}
