import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../ui/card/card.component';
import { WorkerApiService, WorkerResponse } from '../../../core/services/api/worker-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <h2 class="page-title">Admin Dashboard</h2>
    <div class="cards-grid">
      <app-card variant="stat">
        <span>Total Workers</span>
        <h3>{{ workers().length }}</h3>
      </app-card>
      @for (stat of roleStats(); track stat.role) {
        <app-card variant="stat">
          <span>{{ stat.role }}</span>
          <h3>{{ stat.count }}</h3>
        </app-card>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(WorkerApiService);
  workers = signal<WorkerResponse[]>([]);

  roleStats = computed(() => {
    const map: Record<string, number> = {};
    for (const w of this.workers()) {
      map[w.role] = (map[w.role] ?? 0) + 1;
    }
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  });

  ngOnInit() {
    this.api.getAll().subscribe({ next: list => this.workers.set(list) });
  }
}
