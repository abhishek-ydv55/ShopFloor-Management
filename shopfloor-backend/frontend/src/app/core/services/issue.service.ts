import { Injectable, signal, computed } from '@angular/core';

export interface Issue {
  id: string;
  machine: string;
  type: string;
  description: string;
  severity: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

const ISSUES_KEY = 'issues';
const CLOSED_KEY = 'closedIssues';
const DAY_MS     = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class IssueService {
  private _issues = signal<Issue[]>(this.loadFromStorage());

  readonly issues = this._issues.asReadonly();
  readonly openCount = computed(() => this._issues().filter(i => i.status === 'Open').length);
  readonly inProgressCount = computed(() => this._issues().filter(i => i.status === 'In Progress').length);
  readonly closedCount = computed(() => this._issues().filter(i => i.status === 'Closed').length);

  private loadFromStorage(): Issue[] {
    try {
      const raw = JSON.parse(localStorage.getItem(ISSUES_KEY) ?? '[]') as Issue[];
      // Migrate old entries without id
      return raw.map(i => ({ ...i, id: i.id ?? `${i.machine}_${i.description}` }));
    } catch { return []; }
  }

  private persist(data: Issue[]): void {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(data));
  }

  add(issue: Omit<Issue, 'id' | 'status'>): void {
    const newIssue: Issue = {
      ...issue,
      id: `${issue.machine}_${issue.description}_${Date.now()}`,
      status: 'Open'
    };
    const updated = [...this._issues(), newIssue];
    this._issues.set(updated);
    this.persist(updated);
  }

  delete(id: string): void {
    const updated = this._issues().filter(i => i.id !== id);
    this._issues.set(updated);
    this.persist(updated);
    // Also remove from closed tracker
    const closed = this.getClosedTracker();
    delete closed[id];
    localStorage.setItem(CLOSED_KEY, JSON.stringify(closed));
  }

  filter(query: string): Issue[] {
    if (!query.trim()) return this._issues();
    const q = query.toLowerCase();
    return this._issues().filter(i =>
      i.machine.toLowerCase().includes(q) ||
      i.type.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    );
  }

  private getClosedTracker(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(CLOSED_KEY) ?? '{}') as Record<string, number>;
    } catch { return {}; }
  }

  pruneOldClosed(): void {
    const now = Date.now();
    const closed = this.getClosedTracker();
    const toRemove: string[] = [];
    for (const [id, ts] of Object.entries(closed)) {
      if (now - ts >= DAY_MS) toRemove.push(id);
    }
    if (toRemove.length) {
      for (const id of toRemove) delete closed[id];
      localStorage.setItem(CLOSED_KEY, JSON.stringify(closed));
      const updated = this._issues().filter(i => !toRemove.includes(i.id));
      this._issues.set(updated);
      this.persist(updated);
    }
  }
}
