import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { TicketApiService, TicketResponse } from '../../../core/services/api/ticket-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-supervisor-home',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Ticket List</h2>
    <div class="home-wrapper">
      <div class="ticket-list">
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
          <select [(ngModel)]="filterStatus" (change)="applyFilter()" style="padding:8px;">
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
          <select [(ngModel)]="filterPriority" (change)="applyFilter()" style="padding:8px;">
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        @for (t of filtered(); track t.id) {
          <div class="ticket-item" [class.selected]="selectedId() === t.id"
               (click)="select(t)" tabindex="0" role="button"
               [attr.aria-pressed]="selectedId() === t.id" (keydown.enter)="select(t)">
            <div class="ticket-item__header">
              <strong>{{ t.id }}</strong>
              <span class="badge badge--{{t.priority.toLowerCase()}}">{{ t.priority }}</span>
            </div>
            <div style="margin-top:4px; font-size:var(--font-xs); color:var(--text-muted);">
              <span class="badge badge--{{t.status.toLowerCase()}}">{{ t.status }}</span>
              &nbsp; {{ t.currentDepartment }}
            </div>
          </div>
        }
        @if (filtered().length === 0) {
          <p style="color:var(--text-muted); font-size:var(--font-sm);">No tickets found.</p>
        }
      </div>

      @if (selectedTicket()) {
        <div class="details-panel">
          <app-card>
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
              <h3>{{ selectedTicket()!.id }}</h3>
              <div style="display:flex; gap:8px;">
                <span class="badge badge--{{selectedTicket()!.priority.toLowerCase()}}">{{ selectedTicket()!.priority }}</span>
                <span class="badge badge--{{selectedTicket()!.status.toLowerCase()}}">{{ selectedTicket()!.status }}</span>
              </div>
            </div>
            <p style="font-size:var(--font-sm); margin-bottom:8px;"><strong>Department:</strong> {{ selectedTicket()!.currentDepartment }}</p>
            <p style="font-size:var(--font-sm); margin-bottom:16px;"><strong>Description:</strong> {{ selectedTicket()!.description }}</p>

            @if (selectedTicket()!.history?.length) {
              <div class="history-section">
                <h4 class="history-section__title">Activity History</h4>
                <div class="history-list">
                  @for (h of selectedTicket()!.history!; track h.id) {
                    <div class="history-entry">
                      <div class="history-entry__meta">
                        <span class="history-entry__dept">{{ h.department }}</span>
                        <span class="history-entry__date">{{ h.date }}</span>
                      </div>
                      <div class="history-entry__action"><strong>{{ h.action }}</strong> &mdash; {{ h.handledBy }}</div>
                      @if (h.comment) {
                        <div class="history-entry__comment">{{ h.comment }}</div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            @if (selectedTicket()!.isClosable && selectedTicket()!.status !== 'Closed') {
              @if (!showCloseForm()) {
                <app-button variant="danger" size="sm" (clicked)="showCloseForm.set(true)">Close Ticket</app-button>
              } @else {
                <div class="close-form">
                  <label class="close-form__label">Closing Note <span style="color:var(--accent-red);">*</span></label>
                  <textarea class="close-form__textarea" [(ngModel)]="closingComment" rows="3"
                    placeholder="Describe the resolution or action taken..."></textarea>
                  @if (closeFormError) {
                    <p class="close-form__error">{{ closeFormError }}</p>
                  }
                  <div class="close-form__actions">
                    <app-button size="sm" variant="danger" (clicked)="closeTicket()">Confirm Close</app-button>
                    <app-button size="sm" variant="secondary" (clicked)="cancelCloseForm()">Cancel</app-button>
                  </div>
                </div>
              }
            }
            @if (!selectedTicket()!.isClosable && selectedTicket()!.status !== 'Closed') {
              <p style="color:var(--text-muted); font-size:var(--font-xs); margin-top:8px;">This ticket is not yet closable.</p>
            }
          </app-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .home-wrapper { display:grid; grid-template-columns: 280px 1fr; gap:20px; }
    .ticket-list { display:flex; flex-direction:column; gap:8px; }
    .ticket-item { background:var(--white); border:1px solid var(--gray-border); border-radius:var(--radius-md); padding:12px 16px; cursor:pointer; transition:all var(--transition); border-left:3px solid transparent; }
    .ticket-item:hover { border-left-color: var(--red-500); box-shadow: var(--shadow-sm); }
    .ticket-item.selected { border-left-color: var(--red-700); background: var(--gray-light); }
    .ticket-item__header { display:flex; justify-content:space-between; align-items:center; }
    .history-section { border-top: 1px solid var(--gray-border); padding-top: 14px; margin-top: 4px; margin-bottom: 16px; }
    .history-section__title { font-size: var(--font-sm); font-weight: 700; color: var(--text-dark); margin-bottom: 10px; }
    .history-list { display: flex; flex-direction: column; gap: 10px; }
    .history-entry { background: var(--gray-light); border-radius: var(--radius-sm); padding: 10px 12px; border-left: 3px solid var(--red-700); }
    .history-entry__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .history-entry__dept { font-size: var(--font-xs); font-weight: 600; color: var(--red-700); text-transform: uppercase; letter-spacing: 0.04em; }
    .history-entry__date { font-size: var(--font-xs); color: var(--text-muted); }
    .history-entry__action { font-size: var(--font-sm); color: var(--text-dark); margin-bottom: 2px; }
    .history-entry__comment { font-size: var(--font-sm); color: var(--text-muted); font-style: italic; border-top: 1px solid var(--gray-border); padding-top: 6px; margin-top: 4px; }
    .close-form { margin-top: 12px; padding: 14px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: var(--radius-md); }
    .close-form__label { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .close-form__textarea { width: 100%; padding: 8px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: var(--font-sm); resize: vertical; box-sizing: border-box; }
    .close-form__textarea:focus { outline: none; border-color: var(--red-700); }
    .close-form__error { color: var(--accent-red); font-size: var(--font-xs); margin: 4px 0 0; }
    .close-form__actions { display: flex; gap: 8px; margin-top: 10px; }
    @media (max-width:768px) { .home-wrapper { grid-template-columns:1fr; } }
  `]
})
export class SupervisorHomeComponent implements OnInit {
  private api     = inject(TicketApiService);
  private auth    = inject(AuthService);
  private confirm = inject(ConfirmService);

  filterStatus   = '';
  filterPriority = '';
  selectedId     = signal<string | null>(null);
  showCloseForm  = signal(false);
  closingComment = '';
  closeFormError = '';

  private allTickets = signal<TicketResponse[]>([]);
  filtered       = signal<TicketResponse[]>([]);
  selectedTicket = signal<TicketResponse | null>(null);

  ngOnInit() {
    this.api.getAll().subscribe({
      next: list => { this.allTickets.set(list); this.applyFilter(); },
    });
  }

  applyFilter() {
    this.filtered.set(this.allTickets().filter(t =>
      (!this.filterStatus   || t.status   === this.filterStatus) &&
      (!this.filterPriority || t.priority === this.filterPriority)
    ));
  }

  select(t: TicketResponse) {
    this.selectedId.set(t.id);
    this.selectedTicket.set(t);
    this.showCloseForm.set(false);
    this.closingComment = '';
    this.closeFormError = '';
    // Refresh from API so history added by other portals is always visible
    this.api.getById(t.id).subscribe({
      next: fresh => {
        this.selectedTicket.set(fresh);
        this.allTickets.update(list => list.map(x => x.id === fresh.id ? fresh : x));
      }
    });
  }

  cancelCloseForm() {
    this.showCloseForm.set(false);
    this.closingComment = '';
    this.closeFormError = '';
  }

  async closeTicket(): Promise<void> {
    const id = this.selectedId();
    if (!id) return;
    const comment = this.closingComment.trim().replace(/<[^>]*>/g, '');
    if (!comment) { this.closeFormError = 'A closing note is required.'; return; }
    if (comment.length > 500) { this.closeFormError = 'Note cannot exceed 500 characters.'; return; }
    if (!(await this.confirm.ask('Close this ticket? This action cannot be undone.'))) return;
    const handledBy = this.auth.currentUser()?.name ?? 'Supervisor';
    this.api.close(id, comment, handledBy).subscribe({
      next: updated => {
        this.allTickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.selectedTicket.set(updated);
        this.applyFilter();
        this.cancelCloseForm();
      },
    });
  }
}
