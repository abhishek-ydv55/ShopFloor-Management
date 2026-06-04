import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [class]="'btn btn--' + variant + (size ? ' btn--' + size : '') + (fullWidth ? ' btn--full' : '')"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
      [attr.aria-busy]="loading ? 'true' : null"
    >
      <span *ngIf="loading" class="btn__spinner" aria-hidden="true"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: 10px 24px; border-radius: var(--radius-full);
      font-weight: 600; font-size: var(--font-base);
      cursor: pointer; border: none;
      transition: all var(--transition);
      text-decoration: none; justify-content: center;
    }
    .btn--primary { background: var(--red-500); color: #fff; }
    .btn--primary:hover:not(:disabled) { background: var(--red-700); transform: translateY(-2px); box-shadow: var(--shadow-brand); }
    .btn--secondary { background: var(--gray-light); color: var(--text-dark); border: 1.5px solid var(--gray-border); }
    .btn--secondary:hover:not(:disabled) { background: var(--gray-border); }
    .btn--danger { background: var(--accent-red); color: #fff; }
    .btn--danger:hover:not(:disabled) { background: #c00; transform: translateY(-2px); }
    .btn--ghost { background: transparent; color: var(--red-500); border: 2px solid var(--red-500); }
    .btn--ghost:hover:not(:disabled) { background: var(--red-500); color: #fff; }
    .btn--sm { padding: 6px 16px; font-size: var(--font-sm); }
    .btn--lg { padding: 14px 40px; font-size: var(--font-lg); }
    .btn--full { width: 100%; }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
    .btn:active:not(:disabled) { transform: scale(0.97) !important; transition-duration: 0.08s; }
    .btn__spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | '' | 'lg' = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<Event>();
}
