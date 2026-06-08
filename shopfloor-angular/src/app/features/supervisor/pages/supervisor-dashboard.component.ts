import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../ui/card/card.component';
import { TicketApiService, TicketResponse } from '../../../core/services/api/ticket-api.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <h2 class="page-title">Operational Analytics Dashboard</h2>
    <p style="color:var(--text-muted); margin-bottom:24px;">Ticket insights, approval efficiency, and process health at a glance.</p>

    <div class="cards-grid">
      <app-card variant="stat"><span>Total Tickets</span><h3>{{ stats().total }}</h3></app-card>
      <app-card variant="stat"><span>Open</span><h3>{{ stats().open }}</h3></app-card>
      <app-card variant="stat"><span>Pending</span><h3>{{ stats().pending }}</h3></app-card>
      <app-card variant="stat"><span>Closed</span><h3>{{ stats().closed }}</h3></app-card>
      <app-card variant="stat"><span>High Priority</span><h3>{{ stats().high }}</h3></app-card>
    </div>
    <app-card>
      <h3 style="margin-bottom:16px;">Status Breakdown</h3>
      <div class="bar-chart">
        <div class="bar-row" *ngFor="let item of chartData()">
          <span class="bar-label">{{ item.label }}</span>
          <div class="bar-track">
            <div class="bar-fill" [style.width]="item.pct + '%'" [ngClass]="item.cls"></div>
          </div>
          <span class="bar-val">{{ item.value }}</span>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .bar-chart { display:flex; flex-direction:column; gap:12px; }
    .bar-row { display:flex; align-items:center; gap:12px; }
    .bar-label { width:80px; font-size:var(--font-sm); color:var(--text-muted); }
    .bar-track { flex:1; height:16px; background:var(--gray-light); border-radius:8px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:8px; transition: width 0.6s ease; }
    .bar-fill.open    { background: var(--accent-blue); }
    .bar-fill.pending { background: orange; }
    .bar-fill.closed  { background: var(--accent-green); }
    .bar-fill.high    { background: var(--red-500); }
    .bar-val { width:30px; text-align:right; font-size:var(--font-sm); font-weight:600; }
  `]
})
export class SupervisorDashboardComponent implements OnInit {
  private api = inject(TicketApiService);

  tickets = signal<TicketResponse[]>([]);

  stats = computed(() => {
    const t = this.tickets();
    return {
      total:   t.length,
      open:    t.filter(x => x.status === 'Open').length,
      pending: t.filter(x => x.status === 'Pending').length,
      closed:  t.filter(x => x.status === 'Closed').length,
      high:    t.filter(x => x.priority === 'High').length,
    };
  });

  ngOnInit() {
    this.api.getAll().subscribe({ next: list => this.tickets.set(list) });
  }

  chartData() {
    const s = this.stats();
    const max = s.total || 1;
    return [
      { label: 'Open',    value: s.open,    pct: (s.open    / max) * 100, cls: 'open'    },
      { label: 'Pending', value: s.pending, pct: (s.pending / max) * 100, cls: 'pending' },
      { label: 'Closed',  value: s.closed,  pct: (s.closed  / max) * 100, cls: 'closed'  },
      { label: 'High',    value: s.high,    pct: (s.high    / max) * 100, cls: 'high'    },
    ];
  }
}
