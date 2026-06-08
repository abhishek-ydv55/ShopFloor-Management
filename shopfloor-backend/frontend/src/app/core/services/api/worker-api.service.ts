import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface WorkerResponse {
  id: number; empId: string; name: string;
  role: string; email: string; active: boolean; createdAt: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class WorkerApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/workers`;

  getAll(): Observable<WorkerResponse[]> {
    return this.http.get<Api<WorkerResponse[]>>(this.base).pipe(map(r => r.data));
  }

  getByRole(role: string): Observable<WorkerResponse[]> {
    return this.http.get<Api<WorkerResponse[]>>(`${this.base}/role/${role}`).pipe(map(r => r.data));
  }

  create(body: { empId: string; name: string; role: string; email: string; password: string }): Observable<WorkerResponse> {
    return this.http.post<Api<WorkerResponse>>(this.base, body).pipe(map(r => r.data));
  }

  update(empId: string, body: { name: string; role: string; email: string; password?: string }): Observable<WorkerResponse> {
    return this.http.put<Api<WorkerResponse>>(`${this.base}/${empId}`, { ...body, empId }).pipe(map(r => r.data));
  }

  delete(empId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${empId}`);
  }

  toggle(empId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${empId}/toggle-status`, {});
  }
}
