import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface MachineResponse {
  id: string; name: string; status: string;
  hours: number; thresholdHours: number; location: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class MachineApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/machines`;

  getAll(): Observable<MachineResponse[]> {
    return this.http.get<Api<MachineResponse[]>>(this.base).pipe(map(r => r.data));
  }

  getById(id: string): Observable<MachineResponse> {
    return this.http.get<Api<MachineResponse>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(body: { id: string; name: string; status: string; thresholdHours: number; location: string }): Observable<MachineResponse> {
    return this.http.post<Api<MachineResponse>>(this.base, body).pipe(map(r => r.data));
  }

  update(id: string, body: Partial<{ name: string; status: string; thresholdHours: number; location: string }>): Observable<MachineResponse> {
    return this.http.put<Api<MachineResponse>>(`${this.base}/${id}`, body).pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  logHours(machineId: string, hours: number, date: string): Observable<any> {
    return this.http.post<Api<any>>(`${this.base}/hours`, { machine: machineId, hours, date }).pipe(map(r => r.data));
  }

  resetHours(id: string): Observable<MachineResponse> {
    return this.http.post<Api<MachineResponse>>(`${this.base}/${id}/reset-hours`, {}).pipe(map(r => r.data));
  }

  getUseHours(): Observable<any[]> {
    return this.http.get<Api<any[]>>(`${this.base}/hours`).pipe(map(r => r.data));
  }
}
