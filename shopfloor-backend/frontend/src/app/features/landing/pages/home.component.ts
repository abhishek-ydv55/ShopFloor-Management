import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent, NavLink } from '../../../ui/navbar/navbar.component';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class LandingHomeComponent implements OnInit, OnDestroy {
  navLinks: NavLink[] = [
    { label: 'Home',       path: '/' },
    { label: 'About Us',   path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  features = [
    { title: 'Centralised Dashboard', desc: 'Brings all key metrics and insights into a single view for faster decision-making and better control.', img: 'assets/images/feature1.png', alt: 'Centralised Dashboard', reverse: false },
    { title: 'Role Based Management', desc: 'Ensures users access only what they need, improving data security, accountability, and operational clarity.', img: 'assets/images/feature2.png', alt: 'Role Based Management', reverse: true },
    { title: 'Real Time Monitoring',  desc: 'Provides live visibility into operations, helping teams track progress, identify issues early, and respond faster.', img: 'assets/images/feature3.png', alt: 'Real Time Monitoring', reverse: false },
    { title: 'Inter-Department Communication', desc: 'Enables seamless collaboration across departments by breaking silos and ensuring timely, transparent information sharing.', img: 'assets/images/feature4.png', alt: 'Inter-Department Communication', reverse: true },
  ];

  activeCard = signal(0);
  private _timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this._timer = setInterval(() => {
      this.activeCard.update(v => (v + 1) % 3);
    }, 1500);
  }

  ngOnDestroy() { clearInterval(this._timer); }
}
