import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent, NavLink } from '../../../ui/navbar/navbar.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar [links]="navLinks"></app-navbar>
    <div class="contact-banner">
      <div class="overlay"></div>
      <div class="contact-text">
        <h1>Contact Us</h1>
        <p>We would love to hear from you</p>
      </div>
    </div>
    <section class="contact-content">
      <div class="container" style="padding:40px 20px">
        <h2>Get In Touch</h2>
        <p>Reach out to us for support, partnerships, or general inquiries.</p>
        <div class="contact-details">
          <div class="contact-card">
            <span>📧</span>
            <h3>Email</h3>
            <p>support@manuvya.com</p>
          </div>
          <div class="contact-card">
            <span>📞</span>
            <h3>Phone</h3>
            <p>+91-800-MANUVYA</p>
          </div>
          <div class="contact-card">
            <span>📍</span>
            <h3>Address</h3>
            <p>ManuVya Operations Center</p>
          </div>
        </div>
      </div>
    </section>
    <footer class="footer">
      <div class="container" style="padding:16px 20px">
        <p>© All Copyrights reserved to ManuVya<sup class="tm">™</sup>, 2026</p>
      </div>
    </footer>
  `,
  styles: [`
    .contact-banner { position: relative; background: url('/assets/images/contact.png') center/cover no-repeat; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }
    .contact-text { position: relative; color: #fff; text-align: center; z-index: 2; }
    .contact-text h1 { font-size: 3rem; margin-bottom: 10px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
    .contact-text p { font-size: 1.2rem; color: rgba(255,255,255,0.9); }
    .contact-content { background: white; }
    .contact-content h2 { margin-bottom: 12px; }
    .contact-details { margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; text-align: center; }
    .contact-card { padding: 25px; background: var(--gray-light); border: 1px solid var(--gray-border); border-radius: 10px; box-shadow: var(--shadow-md); transition: all 0.3s ease; }
    .contact-card span { font-size: 2rem; display: block; }
    .contact-card h3 { margin: 12px 0 6px; }
    .contact-card:hover { background: var(--grad-brand); color: #fff; transform: translateY(-6px); }
    .contact-card:hover h3, .contact-card:hover p, .contact-card:hover span { color: #fff; }
    .footer { background: linear-gradient(135deg, var(--brown-900), var(--red-700)); color: #fff; text-align: center; }
    .footer p { font-size: var(--font-sm); opacity: 0.85; }
  `]
})
export class ContactComponent {
  navLinks: NavLink[] = [
    { label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }, { label: 'Contact Us', path: '/contact' }
  ];
}
