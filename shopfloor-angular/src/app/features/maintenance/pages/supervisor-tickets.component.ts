import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../ui/card/card.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { TicketApiService, TicketResponse } from '../../../core/services/api/ticket-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-supervisor-tickets',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent],
  template: `
    <h2 class="page-title">Supervisor Tickets</h2>
    <app-card>
      <h3 style="margin-bottom:16px;">Tickets Directed to Maintenance</h3>
      @if (tickets().length > 0) {
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>Priority</th><th>Status</th><th>Description</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tickets(); track t.id) {
                <tr>
                  <td><strong>{{ t.id }}</strong></td>
                  <td>
                    <span class="badge"
                      [class.badge--high]="t.priority === 'High'"
                      [class.badge--medium]="t.priority === 'Medium'"
                      [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                  </td>
                  <td>
                    <span class="badge"
                      [class.badge--open]="t.status === 'Open'"
                      [class.badge--pending]="t.status === 'Pending'"
                      [class.badge--approved]="t.status === 'Closed'">{{ t.status }}</span>
                  </td>
                  <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.description }}</td>
                  <td>
                    @if (t.status !== 'Closed') {
                      <app-button size="sm" (clicked)="startClose(t.id)">Close</app-button>
                    } @else {
                      <span style="color:var(--text-muted); font-size:var(--font-xs);">Closed</span>
                    }
                  </td>
                </tr>
                @if (closingId() === t.id) {
                  <tr>
                    <td colspan="5" class="close-form-cell">
                      <div class="close-form">
                        <label class="close-form__label">Closing Note <span style="color:var(--accent-red);">*</span></label>
                        <textarea class="close-form__textarea" [(ngModel)]="closingComment" rows="3"
                          placeholder="Describe the resolution or action taken..."></textarea>
                        @if (closeFormError) {
                          <p class="close-form__error">{{ closeFormError }}</p>
                        }
                        <div class="close-form__actions">
                          <app-button size="sm" variant="danger" (clicked)="confirmClose(t.id)">Confirm Close</app-button>
                          <app-button size="sm" variant="secondary" (clicked)="cancelClose()">Cancel</app-button>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state__title">No tickets</div>
          <div class="empty-state__msg">Tickets raised by the supervisor for Maintenance will appear here.</div>
        </div>
      }
    </app-card>
  `,
  styles: [`
    .close-form-cell { padding: 0 !important; background: #fafafa; }
    .close-form { padding: 12px 16px; border-top: 1px solid var(--gray-border); border-bottom: 1px solid var(--gray-border); }
    .close-form__label { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .close-form__textarea { width: 100%; padding: 8px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: var(--font-sm); resize: vertical; box-sizing: border-box; }
    .close-form__textarea:focus { outline: none; border-color: var(--red-700); }
    .close-form__error { color: var(--accent-red); font-size: var(--font-xs); margin: 4px 0 0; }
    .close-form__actions { display: flex; gap: 8px; margin-top: 10px; }
  `]
})
export class SupervisorTicketsComponent implements OnInit {
  private api     = inject(TicketApiService);
  private auth    = inject(AuthService);
  private confirm = inject(ConfirmService);

  tickets        = signal<TicketResponse[]>([]);
  closingId      = signal<string | null>(null);
  closingComment = '';
  closeFormError = '';

  ngOnInit() {
    this.api.getAll().subscribe({
      next: list => this.tickets.set(list.filter(t => t.currentDepartment === 'Maintenance'))
    });
  }

  startClose(id: string) {
    this.closingId.set(id);
    this.closingComment = '';
    this.closeFormError = '';
  }

  cancelClose() {
    this.closingId.set(null);
    this.closingComment = '';
    this.closeFormError = '';
  }

  async confirmClose(id: string): Promise<void> {
    const comment = this.closingComment.trim().replace(/<[^>]*>/g, '');
    if (!comment) { this.closeFormError = 'A closing note is required.'; return; }
    if (comment.length > 500) { this.closeFormError = 'Note cannot exceed 500 characters.'; return; }

    if (!(await this.confirm.ask('Close this ticket? This action cannot be undone.'))) return;

    const handledBy = this.auth.currentUser()?.name ?? 'Manager';
    this.api.close(id, comment, handledBy).subscribe({
      next: updated => {
        this.tickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.cancelClose();
      }
    });
  }
}
