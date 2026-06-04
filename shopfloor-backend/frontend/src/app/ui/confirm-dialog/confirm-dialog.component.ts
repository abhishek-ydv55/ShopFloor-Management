import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (svc.isOpen()) {
      <div class="cd-overlay" (click)="svc.dismiss()">
        <div class="cd-box" (click)="$event.stopPropagation()">
          <h4 class="cd-title">{{ svc.title() }}</h4>
          <p class="cd-msg">{{ svc.message() }}</p>
          <div class="cd-actions">
            <button class="cd-btn cd-btn--cancel" (click)="svc.dismiss()">Cancel</button>
            <button class="cd-btn cd-btn--confirm" (click)="svc.confirm()">Confirm</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cd-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; padding: 16px;
      animation: cd-fade 0.15s ease both;
    }
    .cd-box {
      background: #fff; border-radius: 12px; padding: 28px 32px;
      max-width: 420px; width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.22);
      animation: cd-slide 0.18s cubic-bezier(0.34,1.3,0.64,1) both;
    }
    @keyframes cd-fade  { from { opacity:0; } to { opacity:1; } }
    @keyframes cd-slide { from { opacity:0; transform:translateY(-16px) scale(0.97); } to { opacity:1; transform:none; } }
    .cd-title { margin: 0 0 10px; font-size: 1rem; font-weight: 700; color: #1a1a2e; }
    .cd-msg   { margin: 0 0 24px; font-size: 0.875rem; color: #555; line-height: 1.5; }
    .cd-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .cd-btn {
      padding: 9px 22px; border-radius: 8px; font-size: 0.875rem;
      font-weight: 600; cursor: pointer; border: none; transition: background 0.15s;
    }
    .cd-btn--cancel  { background: #f1f3f5; color: #444; }
    .cd-btn--cancel:hover  { background: #e2e4e8; }
    .cd-btn--confirm { background: #b91c1c; color: #fff; }
    .cd-btn--confirm:hover { background: #991b1b; }
  `]
})
export class ConfirmDialogComponent {
  svc = inject(ConfirmService);
}
