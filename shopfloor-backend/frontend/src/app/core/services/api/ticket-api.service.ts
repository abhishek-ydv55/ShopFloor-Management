import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TicketHistoryEntry {
  id: number;
  ticketId: string;
  department: string;
  action: string;
  comment: string;
  handledBy: string;
  date: string;
  createdAt: string;
}

export interface TicketResponse {
  id: string; priority: string; status: string; approvalStatus: string;
  currentDepartment: string; department: string; description: string;
  assignedTechnician?: string; isClosable: boolean;
  createdAt?: string; updatedAt?: string;
  history?: TicketHistoryEntry[];
}

interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tickets`;

  getAll(): Observable<TicketResponse[]> {
    return this.http.get<Api<TicketResponse[]>>(this.base).pipe(map(r => r.data));
  }

  getById(id: string): Observable<TicketResponse> {
    return this.http.get<Api<TicketResponse>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(body: { priority: string; department: string; description: string }): Observable<TicketResponse> {
    return this.http.post<Api<TicketResponse>>(this.base, { ...body, currentDepartment: body.department }).pipe(map(r => r.data));
  }

  approve(id: string): Observable<TicketResponse> {
    return this.http.patch<Api<TicketResponse>>(`${this.base}/${id}/approval`, { approvalStatus: 'Approved' }).pipe(map(r => r.data));
  }

  close(id: string, comment: string, handledBy: string): Observable<TicketResponse> {
    return this.http.patch<Api<TicketResponse>>(`${this.base}/${id}/status`, {
      status: 'Closed', comment, handledBy
    }).pipe(map(r => r.data));
  }
}
