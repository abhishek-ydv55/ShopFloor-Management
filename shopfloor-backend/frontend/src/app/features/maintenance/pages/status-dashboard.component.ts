import { Component, signal, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { MachineApiService, MachineResponse } from '../../../core/services/api/machine-api.service';

@Component({
  selector: 'app-status-dashboard',
  standalone: true,
  imports: [NgClass, FormsModule, CardComponent],
  template: `
    <h2 class="page-title">Status Dashboard</h2>
    <app-card>
      @if (allMachines().length > 0) {
        <div style="display:flex; gap:10px; margin-bottom:16px;">
          <input type="text" [(ngModel)]="searchInput" (input)="applySearch()" placeholder="Search by ID, name or status..." style="flex:1; padding:8px;" />
          @if (searchInput) {
            <button (click)="clearSearch()" style="padding:8px 12px; background:var(--gray-light); border:1px solid var(--gray-border); border-radius:var(--radius-sm); cursor:pointer;">✕</button>
          }
        </div>
        <div class="status-grid">
          @for (m of filteredMachines(); track m.id) {
            <div class="status-card" [ngClass]="'s--' + m.status.toLowerCase()">
              <div class="status-card__id">{{ m.id }}</div>
              <div class="status-card__name">{{ m.name }}</div>
              <span class="badge" [class.badge--approved]="m.status === 'Active'" [class.badge--pending]="m.status === 'Maintenance'" [class.badge--closed]="m.status === 'Inactive'">{{ m.status }}</span>
              <div class="status-card__hours">{{ m.hours }}h</div>
            </div>
          }
        </div>
        @if (filteredMachines().length === 0) {
          <p style="color:var(--text-muted);font-size:var(--font-sm); text-align:center; padding:var(--space-8);">No machines match your search.</p>
        }
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No machines registered</div>
          <div class="empty-state__msg">Machines added by the manager will appear here.</div>
        </div>
      }
    </app-card>
  `,
  styles: [`
    .status-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
    .status-card { background:var(--gray-light); border-radius:var(--radius-md); padding:14px; text-align:center; border-top:4px solid var(--gray-border); transition: box-shadow var(--transition), transform var(--transition); }
    .status-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .s--active      { border-top-color: var(--accent-green); }
    .s--maintenance { border-top-color: orange; }
    .s--inactive    { border-top-color: var(--text-muted); }
    .status-card__id   { font-weight:700; font-size:var(--font-sm); margin-bottom:4px; }
    .status-card__name { font-size:var(--font-xs); color:var(--text-muted); margin-bottom:8px; }
    .status-card__hours { font-size:var(--font-xs); color:var(--text-muted); margin-top:6px; }
  `]
})
export class StatusDashboardComponent implements OnInit {
  private api = inject(MachineApiService);

  allMachines      = signal<MachineResponse[]>([]);
  filteredMachines = signal<MachineResponse[]>([]);
  searchInput      = '';

  ngOnInit() {
    this.api.getAll().subscribe({
      next: list => { this.allMachines.set(list); this.filteredMachines.set(list); }
    });
  }

  applySearch() {
    const q = this.searchInput.toLowerCase();
    this.filteredMachines.set(q
      ? this.allMachines().filter(m =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.status.toLowerCase().includes(q)
        )
      : this.allMachines()
    );
  }

  clearSearch() {
    this.searchInput = '';
    this.filteredMachines.set(this.allMachines());
  }
}
