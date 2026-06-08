import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface MaintenanceIssueResponse {
  id: number; machine: string; type: string; description: string;
  severity: string; date: string; status: string; reportedBy: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class MaintenanceIssueApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/issues`;

  getAll(): Observable<MaintenanceIssueResponse[]> {
    return this.http.get<Api<MaintenanceIssueResponse[]>>(this.base).pipe(map(r => r.data));
  }

  create(body: { machine: string; type: string; description: string; severity: string; date: string; reportedBy: string }): Observable<MaintenanceIssueResponse> {
    return this.http.post<Api<MaintenanceIssueResponse>>(this.base, body).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: string): Observable<MaintenanceIssueResponse> {
    return this.http.patch<Api<MaintenanceIssueResponse>>(`${this.base}/${id}/status`, { status }).pipe(map(r => r.data));
  }
}
