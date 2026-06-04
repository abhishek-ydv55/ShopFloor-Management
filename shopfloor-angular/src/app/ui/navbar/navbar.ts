import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <div class="topbar" role="banner">
      <div class="logo">
        <img src="assets/images/logo.png" alt="ManuVya logo" />
      </div>
      <div class="title">{{ title }}</div>
      <div class="notification">
        <button class="notify-btn" (click)="toggleNotif($event)" aria-label="Notifications">
          Notifications 🔔
        </button>
        <div class="notify-dropdown" [class.open]="notifOpen()" role="menu">
          <h4>Notifications</h4>
          <ul>
            <li>Maintenance job #102 completed</li>
            <li>Machine M4 crossed threshold</li>
            <li>New procurement request</li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class NavbarComponent {
  @Input() title = 'Shop Floor Management';
  notifOpen = signal(false);
  toggleNotif(e: Event) { e.stopPropagation(); this.notifOpen.update(v => !v); }
}
