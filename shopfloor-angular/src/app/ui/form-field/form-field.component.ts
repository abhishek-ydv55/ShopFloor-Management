import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-field" [class.form-field--error]="!!error">
      <label *ngIf="label" [for]="fieldId" class="form-field__label">
        {{ label }}<span *ngIf="required" class="form-field__req" aria-hidden="true"> *</span>
      </label>
      <ng-content></ng-content>
      <small *ngIf="error" class="form-field__error" role="alert">{{ error }}</small>
      <small *ngIf="hint && !error" class="form-field__hint">{{ hint }}</small>
    </div>
  `,
  styles: [`
    .form-field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); }
    .form-field__label { font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); }
    .form-field__req { color: var(--red-500); }
    .form-field__error { color: var(--accent-red); font-size: var(--font-xs); }
    .form-field__hint  { color: var(--text-muted); font-size: var(--font-xs); }
  `]
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() fieldId = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() required = false;
}
