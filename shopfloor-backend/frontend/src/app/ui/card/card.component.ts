import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card--stat]="variant === 'stat'" [class.card--panel]="variant === 'panel'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-md);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      animation: fadeInUp 0.3s ease both;
    }
    .card--stat {
      padding: var(--space-5);
      border-top: 3px solid var(--gray-border);
    }
    .card--stat:hover { border-top-color: var(--red-700); }
    .card--stat span { font-size: var(--font-sm); color: var(--text-muted); display: block; margin-bottom: var(--space-1); }
    .card--stat h3  { font-size: var(--font-3xl); color: var(--red-700); }
    .card--panel {
      margin-bottom: var(--space-6);
    }
  `]
})
export class CardComponent {
  @Input() variant: 'default' | 'stat' | 'panel' = 'default';
}
