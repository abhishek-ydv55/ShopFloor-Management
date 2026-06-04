import { Injectable, signal } from '@angular/core';
import { Ticket, MaintenanceIssue, MachineUseHour } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  tickets = signal<Ticket[]>(this._loadTickets());
  issues = signal<MaintenanceIssue[]>(this._load('issues'));
  useHours = signal<MachineUseHour[]>(this._load('useHours'));

  private _loadTickets(): Ticket[] {
    try {
      const raw = localStorage.getItem('tickets');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private _load<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
  }

  private _saveTickets(t: Ticket[]): void {
    localStorage.setItem('tickets', JSON.stringify(t));
    this.tickets.set(t);
  }

  closeTicket(id: string): void {
    this._saveTickets(this.tickets().map(t => t.id === id ? { ...t, status: 'Closed', isClosable: false } : t));
  }

  createTicket(ticket: Omit<Ticket, 'id'>): Ticket {
    const id = 'TCK-' + (1000 + this.tickets().length + 1);
    const t: Ticket = { ...ticket, id } as Ticket;
    this._saveTickets([...this.tickets(), t]);
    return t;
  }

  reportIssue(issue: MaintenanceIssue): void {
    const all = [...this.issues(), issue];
    localStorage.setItem('issues', JSON.stringify(all));
    this.issues.set(all);
  }

  saveUseHour(entry: MachineUseHour): void {
    const all = [...this.useHours(), entry];
    localStorage.setItem('useHours', JSON.stringify(all));
    this.useHours.set(all);
  }

  getStats() {
    const t = this.tickets();
    return {
      total: t.length,
      open: t.filter(x => x.status === 'Open').length,
      pending: t.filter(x => x.status === 'Pending').length,
      closed: t.filter(x => x.status === 'Closed').length,
      high: t.filter(x => x.priority === 'High').length,
    };
  }
}
