import { Injectable, signal } from '@angular/core';
import { Worker } from '../models/worker.model';

const STORAGE_KEY = 'workers';

@Injectable({ providedIn: 'root' })
export class WorkerService {
  workers = signal<Worker[]>(this._load());

  private _load(): Worker[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch { return []; }
  }

  private _save(workers: Worker[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
    this.workers.set(workers);
  }

  register(worker: Worker): { success: boolean; message: string } {
    const existing = this.workers();
    if (existing.some(w => w.empId === worker.empId)) {
      return { success: false, message: 'Employee ID already exists.' };
    }
    this._save([...existing, worker]);
    return { success: true, message: 'Worker registered successfully.' };
  }

  remove(searchType: string, searchValue: string): { success: boolean; message: string } {
    const workers = this.workers();
    const v = searchValue.toLowerCase();
    const filtered = workers.filter(w => {
      if (searchType === 'id')   return w.empId.toLowerCase() !== v;
      if (searchType === 'name') return w.name.toLowerCase() !== v;
      if (searchType === 'role') return w.role.toLowerCase() !== v;
      return true;
    });
    if (filtered.length === workers.length) {
      return { success: false, message: 'No worker found to delete.' };
    }
    this._save(filtered);
    return { success: true, message: 'Worker deleted successfully.' };
  }

  find(searchType: string, searchValue: string): Worker | null {
    if (!searchValue) return null;
    const v = searchValue.toLowerCase();
    return this.workers().find(w => {
      if (searchType === 'id')   return w.empId.toLowerCase() === v;
      if (searchType === 'name') return w.name.toLowerCase() === v;
      if (searchType === 'role') return w.role.toLowerCase() === v;
      return false;
    }) ?? null;
  }

  search(searchType: string, keyword: string): Worker[] {
    if (!keyword || searchType === 'all') return this.workers();
    const k = keyword.toLowerCase();
    return this.workers().filter(w => {
      if (searchType === 'empId') return w.empId.toLowerCase().includes(k);
      if (searchType === 'name')  return w.name.toLowerCase().includes(k);
      if (searchType === 'role')  return w.role.toLowerCase().includes(k);
      return true;
    });
  }
}
