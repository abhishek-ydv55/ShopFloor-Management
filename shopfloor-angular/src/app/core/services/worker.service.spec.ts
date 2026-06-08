import { TestBed } from '@angular/core/testing';
import { WorkerService } from './worker.service';

describe('WorkerService', () => {
  let svc: WorkerService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    svc = TestBed.inject(WorkerService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => expect(svc).toBeTruthy());

  it('should start with empty workers list', () => {
    expect(svc.workers().length).toBe(0);
  });

  it('should register a new worker', () => {
    const res = svc.register({ empId: 'EMP001', name: 'Alice', role: 'Technician', password: 'pass' });
    expect(res.success).toBeTrue();
    expect(svc.workers().length).toBe(1);
  });

  it('should reject duplicate empId', () => {
    svc.register({ empId: 'EMP001', name: 'Alice', role: 'Technician', password: 'pass' });
    const res = svc.register({ empId: 'EMP001', name: 'Bob', role: 'Manager', password: 'pass2' });
    expect(res.success).toBeFalse();
    expect(svc.workers().length).toBe(1);
  });

  it('should remove a worker by id', () => {
    svc.register({ empId: 'EMP001', name: 'Alice', role: 'Technician', password: 'pass' });
    const res = svc.remove('id', 'EMP001');
    expect(res.success).toBeTrue();
    expect(svc.workers().length).toBe(0);
  });

  it('should return failure when removing non-existent worker', () => {
    const res = svc.remove('id', 'NOTEXIST');
    expect(res.success).toBeFalse();
  });

  it('should find a worker by name (case-insensitive)', () => {
    svc.register({ empId: 'EMP001', name: 'Alice Smith', role: 'Technician', password: 'pass' });
    const found = svc.find('name', 'alice smith');
    expect(found?.empId).toBe('EMP001');
  });

  it('should return null when no match found', () => {
    expect(svc.find('id', 'NOTEXIST')).toBeNull();
  });

  it('should filter workers by keyword', () => {
    svc.register({ empId: 'EMP001', name: 'Alice', role: 'Technician', password: 'pass' });
    svc.register({ empId: 'EMP002', name: 'Bob',   role: 'Manager',    password: 'pass' });
    expect(svc.search('name', 'alice').length).toBe(1);
    expect(svc.search('all', '').length).toBe(2);
  });

  it('should persist workers in localStorage', () => {
    svc.register({ empId: 'EMP001', name: 'Alice', role: 'Technician', password: 'pass' });
    const raw = localStorage.getItem('workers');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed[0].empId).toBe('EMP001');
  });
});
