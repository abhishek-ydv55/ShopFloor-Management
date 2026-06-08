import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface NavLink { label: string; path: string; }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar" role="banner">
      <div class="navbar__left">
        <img src="assets/images/logo.png" alt="ManuVya Logo" class="navbar__logo" />
        <nav class="navbar__links" aria-label="Primary navigation">
          <a *ngFor="let link of links" [routerLink]="link.path" routerLinkActive="active">
            {{ link.label }}
          </a>
        </nav>
      </div>
      <div class="navbar__right">
        <span class="navbar__title" *ngIf="title">{{ title }}</span>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 30px; background: var(--grad-header); color: #fff;
      position: sticky; top: 0; z-index: 100;
    }
    .navbar__left { display: flex; align-items: center; gap: 30px; }
    .navbar__logo { height: 48px; }
    .navbar__links a { color: #fff; text-decoration: none; font-size: var(--font-sm); margin-right: 20px; opacity: 0.9; transition: opacity var(--transition); }
    .navbar__links a:hover, .navbar__links a.active { opacity: 1; text-decoration: underline; }
    .navbar__title { font-size: var(--font-lg); font-weight: 600; }
  `]
})
export class NavbarComponent {
  @Input() links: NavLink[] = [];
  @Input() title = '';
}
