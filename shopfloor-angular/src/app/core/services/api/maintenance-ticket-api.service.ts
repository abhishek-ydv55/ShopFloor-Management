import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface MaintenanceTicketResponse {
  id: number; ticketCode: string; machineId: string; machineName: string;
  hoursUsed: number; thresholdHours: number; priority: string; status: string;
  assignedTo?: string; taskId?: string; raisedAt: string; completedAt?: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class MaintenanceTicketApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/maintenance-tickets`;

  getAll(): Observable<MaintenanceTicketResponse[]> {
    return this.http.get<Api<MaintenanceTicketResponse[]>>(this.base).pipe(map(r => r.data));
  }

  assign(id: number, technicianName: string, taskId: string): Observable<MaintenanceTicketResponse> {
    return this.http.patch<Api<MaintenanceTicketResponse>>(`${this.base}/${id}/assign`, { technicianName, taskId }).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: string): Observable<MaintenanceTicketResponse> {
    return this.http.patch<Api<MaintenanceTicketResponse>>(`${this.base}/${id}/status`, { status }).pipe(map(r => r.data));
  }

  complete(id: number): Observable<MaintenanceTicketResponse> {
    return this.http.post<Api<MaintenanceTicketResponse>>(`${this.base}/${id}/complete`, {}).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  deleteCompleted(): Observable<void> {
    return this.http.delete<void>(`${this.base}/completed`);
  }
}
