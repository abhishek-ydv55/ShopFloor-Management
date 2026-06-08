import { TestBed } from '@angular/core/testing';
import { IssueService } from './issue.service';

const MOCK_ISSUE = {
  machine: 'M-1', type: 'Mechanical', description: 'Oil leak',
  severity: 'High', date: '2026-05-01'
};

describe('IssueService', () => {
  let service: IssueService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueService);
  });
  afterEach(() => localStorage.clear());

  it('should be created', () => expect(service).toBeTruthy());
  it('starts empty', () => expect(service.issues().length).toBe(0));

  it('adds an issue with status Open', () => {
    service.add(MOCK_ISSUE);
    expect(service.issues().length).toBe(1);
    expect(service.issues()[0].status).toBe('Open');
    expect(service.openCount()).toBe(1);
  });

  it('persists to localStorage', () => {
    service.add(MOCK_ISSUE);
    const raw = JSON.parse(localStorage.getItem('issues')!);
    expect(raw.length).toBe(1);
  });

  it('deletes an issue by id', () => {
    service.add(MOCK_ISSUE);
    const id = service.issues()[0].id;
    service.delete(id);
    expect(service.issues().length).toBe(0);
  });

  it('filters by machine name', () => {
    service.add(MOCK_ISSUE);
    service.add({ ...MOCK_ISSUE, machine: 'M-2' });
    const results = service.filter('M-1');
    expect(results.length).toBe(1);
  });

  it('counts open/in-progress/closed separately', () => {
    service.add(MOCK_ISSUE);
    expect(service.openCount()).toBe(1);
    expect(service.inProgressCount()).toBe(0);
    expect(service.closedCount()).toBe(0);
  });
});
