import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent, NavLink } from '../../ui/navbar/navbar.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { FormFieldComponent } from '../../ui/form-field/form-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, ButtonComponent, FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  navLinks: NavLink[] = [
    { label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }, { label: 'Contact Us', path: '/contact' }
  ];

  email = '';
  password = '';
  rememberMe = false;
  showPassword = signal(false);
  loading = signal(false);

  emailError    = signal('');
  passwordError = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() { this.showPassword.update(v => !v); }

  private _validateEmail(): boolean {
    if (!this.email.trim()) { this.emailError.set('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) { this.emailError.set('Enter a valid email address'); return false; }
    this.emailError.set(''); return true;
  }

  private _validatePassword(): boolean {
    const p = this.password.trim();
    if (!p) { this.passwordError.set('Password is required'); return false; }
    const missing: string[] = [];
    if (p.length < 8) missing.push('at least 8 characters');
    if (!/[A-Z]/.test(p)) missing.push('one uppercase letter');
    if (!/[0-9]/.test(p)) missing.push('one number');
    if (!/[!@#$%^&*()]/.test(p)) missing.push('one special character');
    if (missing.length > 0) { this.passwordError.set('Password must contain ' + missing.join(', ')); return false; }
    this.passwordError.set(''); return true;
  }

  onSubmit() {
    const emailOk = this._validateEmail();
    const passOk  = this._validatePassword();
    if (!emailOk || !passOk) return;

    this.loading.set(true);
    this.auth.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (res) => {
        const route = this.auth.getRedirectRoute(res.data.role);
        this.router.navigate([route]);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Invalid email or password';
        if (msg.toLowerCase().includes('password')) {
          this.passwordError.set(msg);
        } else {
          this.emailError.set(msg);
        }
        this.loading.set(false);
      }
    });
  }
}
