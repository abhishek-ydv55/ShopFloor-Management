import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let svc: TicketService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    svc = TestBed.inject(TicketService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => expect(svc).toBeTruthy());

  it('should seed 3 tickets on first load', () => {
    expect(svc.tickets().length).toBe(3);
  });

  it('should get correct stats', () => {
    const stats = svc.getStats();
    expect(stats.total).toBe(3);
    expect(stats.open).toBeGreaterThanOrEqual(0);
  });

  it('should close a ticket', () => {
    const id = svc.tickets()[0].id;
    svc.closeTicket(id);
    const updated = svc.tickets().find(t => t.id === id);
    expect(updated?.status).toBe('Closed');
    expect(updated?.isClosable).toBeFalse();
  });

  it('should create a new ticket with generated ID', () => {
    const before = svc.tickets().length;
    const t = svc.createTicket({
      priority: 'High', status: 'Open', approvalStatus: 'Pending',
      currentDepartment: 'Maintenance', isClosable: false,
      history: [{ department: 'Maintenance', action: 'Test', comment: 'Test', handledBy: 'X', date: '2026-01-01' }]
    });
    expect(t.id).toBeTruthy();
    expect(svc.tickets().length).toBe(before + 1);
  });

  it('should report a maintenance issue', () => {
    svc.reportIssue({ machine: 'FM-101', type: 'Electrical', description: 'Spark', severity: 'High', date: '2026-01-01', status: 'Open' });
    expect(svc.issues().length).toBe(1);
  });

  it('should save a use hour entry', () => {
    svc.saveUseHour({ machine: 'FM-101', hours: 8, date: '2026-01-01' });
    expect(svc.useHours().length).toBe(1);
    expect(svc.useHours()[0].hours).toBe(8);
  });
});
