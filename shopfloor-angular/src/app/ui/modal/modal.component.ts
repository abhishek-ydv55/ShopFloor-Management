import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="modal-overlay" role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="onOverlayClick($event)">
      <div class="modal-box" tabindex="-1">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" aria-label="Close dialog" (click)="closed.emit()">✕</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: var(--space-4);
      animation: overlay-in 0.2s ease both;
    }
    .modal-box {
      background: var(--white); border-radius: var(--radius-xl);
      padding: var(--space-6); width: 100%; max-width: 520px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      animation: modal-in 0.22s cubic-bezier(0.34, 1.30, 0.64, 1) both;
    }
    @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modal-in { from { opacity:0; transform: translateY(-20px) scale(0.97); } to { opacity:1; transform: none; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
    .modal-header h3 { font-size: var(--font-xl); }
    .modal-close { background: none; border: none; font-size: var(--font-lg); cursor: pointer; padding: var(--space-1); border-radius: var(--radius-sm); }
    .modal-close:hover { background: var(--gray-light); }
    .modal-footer { margin-top: var(--space-4); display: flex; gap: var(--space-3); justify-content: flex-end; }
  `]
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() showFooter = false;
  @Output() closed = new EventEmitter<void>();

  @HostListener('keydown.escape')
  onEscape() { this.closed.emit(); }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closed.emit();
  }
}
