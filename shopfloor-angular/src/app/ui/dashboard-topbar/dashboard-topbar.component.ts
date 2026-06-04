import { Component, Input } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [NotificationComponent],
  template: `
    <header class="dash-topbar">
      <div class="dash-topbar__logo">
        <img src="assets/images/logo.png" alt="ManuVya Logo" />
      </div>
      <div class="dash-topbar__title">{{ title }}</div>
      <div class="dash-topbar__right">
        <app-notification></app-notification>
      </div>
    </header>
  `,
  styles: [`
    .dash-topbar {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 24px;
      background: var(--cream-bg);
      height: var(--topbar-height);
      flex-shrink: 0;
      z-index: 100;
      position: relative;
      border-bottom: 1px solid var(--gray-border);
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .dash-topbar::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--grad-header);
      opacity: 0.35;
    }
    .dash-topbar__logo img { height: 40px; display: block; }
    .dash-topbar__title {
      font-size: var(--font-lg);
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-dark);
      white-space: nowrap;
    }
    .dash-topbar__right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  `]
})
export class DashboardTopbarComponent {
  @Input() title = '';
}
