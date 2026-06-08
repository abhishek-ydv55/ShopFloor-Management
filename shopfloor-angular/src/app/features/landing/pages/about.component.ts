import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent, NavLink } from '../../../ui/navbar/navbar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar [links]="navLinks"></app-navbar>
    <div class="about-banner">
      <div class="overlay"></div>
      <div class="about-text">
        <h1>About ManuVya<sup class="tm">™</sup></h1>
        <p>Your smart shop floor management solution</p>
      </div>
    </div>
    <section class="about-content">
      <div class="container" style="padding:40px 20px">
        <h2>Who We Are</h2>
        <p>ManuVya is a comprehensive shop floor management system designed to streamline operations, improve workforce management, and resolve issues efficiently. Our platform brings all key stakeholders — supervisors, technicians, managers, and administrators — onto a single governed system.</p>
        <br>
        <h2>Our Mission</h2>
        <p>To empower manufacturing and production teams with the tools they need to operate smartly, safely, and efficiently.</p>
      </div>
    </section>
    <footer class="footer">
      <div class="container" style="padding:16px 20px">
        <p>© All Copyrights reserved to ManuVya<sup class="tm">™</sup>, 2026</p>
      </div>
    </footer>
  `,
  styles: [`
    .about-banner { position: relative; background: url('/assets/images/about.png') center/cover no-repeat; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }
    .about-text { position: relative; color: #fff; text-align: center; z-index: 2; }
    .about-text h1 { font-size: 3rem; margin-bottom: 10px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
    .about-text p { font-size: 1.2rem; color: rgba(255,255,255,0.9); }
    .about-content { background: white; padding: 40px 0; }
    .about-content h2 { margin-bottom: 12px; }
    .footer { background: linear-gradient(135deg, var(--brown-900), var(--red-700)); color: #fff; text-align: center; }
    .footer p { font-size: var(--font-sm); opacity: 0.85; }
  `]
})
export class AboutComponent {
  navLinks: NavLink[] = [
    { label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }, { label: 'Contact Us', path: '/contact' }
  ];
}
