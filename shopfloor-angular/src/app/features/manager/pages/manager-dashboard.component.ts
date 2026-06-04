import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CardComponent } from '../../../ui/card/card.component';
import { MachineApiService, MachineResponse } from '../../../core/services/api/machine-api.service';
import { TicketApiService, TicketResponse } from '../../../core/services/api/ticket-api.service';
import { SpareRequestApiService, SpareRequestResponse } from '../../../core/services/api/spare-request-api.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CardComponent],
  template: `
    <h2 class="page-title">Manager Dashboard</h2>

    <div class="cards-grid">
      <app-card variant="stat"><span>Total Machines</span><h3>{{ machineStats().total }}</h3></app-card>
      <app-card variant="stat"><span>Active Machines</span><h3 style="color:var(--accent-green);">{{ machineStats().active }}</h3></app-card>
      <app-card variant="stat"><span>Under Maintenance</span><h3 style="color:#f59e0b;">{{ machineStats().maintenance }}</h3></app-card>
      <app-card variant="stat"><span>Open Tickets</span><h3 style="color:var(--accent-red);">{{ ticketStats().open }}</h3></app-card>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Donut: Ticket Status -->
      <app-card>
        <h3 class="section-title">Ticket Status</h3>
        @if (ticketStats().total > 0) {
          <div class="chart-area">
            <div class="donut" [style.background]="ticketDonutStyle()">
              <div class="donut__hole">
                <span class="donut__val">{{ ticketStats().total }}</span>
                <span class="donut__lbl">Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-red);"></span>Open ({{ ticketStats().open }})</div>
              <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span>Pending ({{ ticketStats().pending }})</div>
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-green);"></span>Closed ({{ ticketStats().closed }})</div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state__title">No tickets yet</div>
            <div class="empty-state__msg">Ticket data will appear here once supervisors raise tickets.</div>
          </div>
        }
      </app-card>

      <!-- Bar: Machine Status -->
      <app-card>
        <h3 class="section-title">Machine Status</h3>
        @if (machineStats().total > 0) {
          <div class="bar-wrap">
            <svg viewBox="0 0 220 150" width="100%" style="display:block;">
              <line x1="0" y1="30"  x2="220" y2="30"  stroke="#eee" stroke-width="1"/>
              <line x1="0" y1="75"  x2="220" y2="75"  stroke="#eee" stroke-width="1"/>
              <line x1="0" y1="120" x2="220" y2="120" stroke="#eee" stroke-width="1"/>
              <rect [attr.y]="120 - machineBarActive()" x="20" width="50" [attr.height]="machineBarActive() || 2" fill="var(--accent-green)" rx="3"/>
              @if (machineStats().active > 0) {
                <text x="45" [attr.y]="114 - machineBarActive()" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-dark)">{{ machineStats().active }}</text>
              }
              <text x="45" y="136" text-anchor="middle" font-size="10" fill="var(--text-muted)">Active</text>
              <rect [attr.y]="120 - machineBarMaint()" x="85" width="50" [attr.height]="machineBarMaint() || 2" fill="#f59e0b" rx="3"/>
              @if (machineStats().maintenance > 0) {
                <text x="110" [attr.y]="114 - machineBarMaint()" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-dark)">{{ machineStats().maintenance }}</text>
              }
              <text x="110" y="136" text-anchor="middle" font-size="10" fill="var(--text-muted)">Maint.</text>
              <rect [attr.y]="120 - machineBarInactive()" x="150" width="50" [attr.height]="machineBarInactive() || 2" fill="var(--text-muted)" rx="3"/>
              @if (machineStats().inactive > 0) {
                <text x="175" [attr.y]="114 - machineBarInactive()" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-dark)">{{ machineStats().inactive }}</text>
              }
              <text x="175" y="136" text-anchor="middle" font-size="10" fill="var(--text-muted)">Inactive</text>
            </svg>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state__title">No machines registered</div>
            <div class="empty-state__msg">Add machines via Manage Machines to see stats here.</div>
          </div>
        }
      </app-card>
    </div>

    <!-- Alerts -->
    <app-card>
      <h3 class="section-title">System Alerts</h3>
      <ul class="alert-list">
        @if (ticketStats().high > 0) {
          <li class="alert-item alert-item--high">{{ ticketStats().high }} high-priority ticket(s) require immediate attention</li>
        }
        @if (pendingSpareCount() > 0) {
          <li class="alert-item alert-item--warn">{{ pendingSpareCount() }} spare part request(s) awaiting procurement approval</li>
        }
        @if (machineStats().maintenance > 0) {
          <li class="alert-item alert-item--warn">{{ machineStats().maintenance }} machine(s) currently under maintenance</li>
        }
        @if (ticketStats().high === 0 && pendingSpareCount() === 0 && machineStats().maintenance === 0 && ticketStats().total > 0) {
          <li class="alert-item alert-item--ok">All systems operating normally — no critical alerts</li>
        }
        @if (ticketStats().total === 0 && machineStats().total === 0) {
          <li class="alert-item alert-item--ok">Dashboard ready — start by registering machines and creating tickets</li>
        }
      </ul>
    </app-card>
  `,
  styles: [`
    .section-title { margin-bottom: var(--space-4); font-size: var(--font-lg); font-weight: 700; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); margin: var(--space-5) 0; }
    .chart-area { display: flex; align-items: center; gap: var(--space-6); }
    .donut {
      width: 140px; height: 140px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; position: relative;
    }
    .donut__hole {
      width: 82px; height: 82px; border-radius: 50%;
      background: var(--white); position: absolute;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .donut__val { font-size: var(--font-xl); font-weight: 800; color: var(--text-dark); line-height: 1; }
    .donut__lbl { font-size: var(--font-xs); color: var(--text-muted); }
    .donut-legend { display: flex; flex-direction: column; gap: var(--space-2); }
    .legend-item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-sm); color: var(--text-dark); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .bar-wrap { padding-top: var(--space-2); }
    .alert-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); margin: 0; padding: 0; }
    .alert-item { font-size: var(--font-sm); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border-left: 4px solid; animation: fadeInUp 0.3s ease both; }
    .alert-item--high { background: #fff5f5; border-left-color: var(--accent-red); color: #991b1b; }
    .alert-item--warn { background: #fffbeb; border-left-color: #f59e0b; color: #92400e; }
    .alert-item--ok   { background: #f0fdf4; border-left-color: var(--accent-green); color: #14532d; }
    @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  private machineApi = inject(MachineApiService);
  private ticketApi  = inject(TicketApiService);
  private spareApi   = inject(SpareRequestApiService);

  private machines     = signal<MachineResponse[]>([]);
  private tickets      = signal<TicketResponse[]>([]);
  private spareReqs    = signal<SpareRequestResponse[]>([]);

  machineStats = computed(() => {
    const m = this.machines();
    return {
      active:      m.filter(x => x.status === 'Active').length,
      maintenance: m.filter(x => x.status === 'Maintenance').length,
      inactive:    m.filter(x => x.status === 'Inactive').length,
      total:       m.length,
    };
  });

  ticketStats = computed(() => {
    const t = this.tickets();
    return {
      total:   t.length,
      open:    t.filter(x => x.status === 'Open').length,
      pending: t.filter(x => x.status === 'Pending').length,
      closed:  t.filter(x => x.status === 'Closed').length,
      high:    t.filter(x => x.priority === 'High').length,
    };
  });

  pendingSpareCount = computed(() => this.spareReqs().filter(r => r.status === 'Pending').length);

  ngOnInit() {
    this.machineApi.getAll().subscribe({ next: list => this.machines.set(list) });
    this.ticketApi.getAll().subscribe({ next: list => this.tickets.set(list) });
    this.spareApi.getAll().subscribe({ next: list => this.spareReqs.set(list) });
  }

  ticketDonutStyle = computed(() => {
    const s     = this.ticketStats();
    const total = s.total || 1;
    const op    = (s.open    / total) * 360;
    const pp    = op + (s.pending / total) * 360;
    return `conic-gradient(var(--accent-red) 0deg ${op}deg, #f59e0b ${op}deg ${pp}deg, var(--accent-green) ${pp}deg 360deg)`;
  });

  machineBarActive   = computed(() => Math.round((this.machineStats().active      / (this.machineStats().total || 1)) * 90));
  machineBarMaint    = computed(() => Math.round((this.machineStats().maintenance / (this.machineStats().total || 1)) * 90));
  machineBarInactive = computed(() => Math.round((this.machineStats().inactive    / (this.machineStats().total || 1)) * 90));
}
