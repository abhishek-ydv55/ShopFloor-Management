import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ProcurementTicketResponse {
  id: number; name: string; type: string; department: string; priority: string;
  status: string; createdAtDisplay: string; description: string;
  remark?: string; sentToExternal: boolean;
}
export interface InternalRequestResponse {
  id: number; requestCode: string; item: string; qty: number; dept: string;
  priority: string; status: string; requestedBy: string; createdAt: string;
}
export interface ExternalRequestResponse {
  id: number; requestCode: string; procurementTicketId?: number;
  procurementTicketName?: string; name: string; department: string;
  priority: string; status: string; requestedDate: string; vendor?: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class ProcurementApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/procurement`;

  // Department Tickets
  getAllTickets(): Observable<ProcurementTicketResponse[]> {
    return this.http.get<Api<ProcurementTicketResponse[]>>(`${this.base}/tickets`).pipe(map(r => r.data));
  }
  createTicket(body: { name: string; type: string; department: string; priority: string; description: string }): Observable<ProcurementTicketResponse> {
    return this.http.post<Api<ProcurementTicketResponse>>(`${this.base}/tickets`, body).pipe(map(r => r.data));
  }
  addRemark(id: number, remark: string): Observable<ProcurementTicketResponse> {
    return this.http.patch<Api<ProcurementTicketResponse>>(`${this.base}/tickets/${id}/remark`, { remark }).pipe(map(r => r.data));
  }
  sendToExternal(id: number): Observable<ProcurementTicketResponse> {
    return this.http.post<Api<ProcurementTicketResponse>>(`${this.base}/tickets/${id}/send-to-external`, {}).pipe(map(r => r.data));
  }
  getExternalTickets(): Observable<ProcurementTicketResponse[]> {
    return this.http.get<Api<ProcurementTicketResponse[]>>(`${this.base}/tickets/external`).pipe(map(r => r.data));
  }
  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tickets/${id}`);
  }
  deleteCompletedTickets(): Observable<void> {
    return this.http.delete<void>(`${this.base}/tickets/completed`);
  }

  // Internal Requests
  getAllInternalRequests(): Observable<InternalRequestResponse[]> {
    return this.http.get<Api<InternalRequestResponse[]>>(`${this.base}/internal-requests`).pipe(map(r => r.data));
  }
  createInternalRequest(body: { item: string; qty: number; dept: string; priority: string; requestedBy: string }): Observable<InternalRequestResponse> {
    return this.http.post<Api<InternalRequestResponse>>(`${this.base}/internal-requests`, body).pipe(map(r => r.data));
  }
  approveInternalRequest(id: number): Observable<InternalRequestResponse> {
    return this.http.post<Api<InternalRequestResponse>>(`${this.base}/internal-requests/${id}/approve`, {}).pipe(map(r => r.data));
  }
  updateInternalRequestStatus(id: number, status: string): Observable<InternalRequestResponse> {
    return this.http.patch<Api<InternalRequestResponse>>(`${this.base}/internal-requests/${id}/status`, { status }).pipe(map(r => r.data));
  }
  deleteInternalRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/internal-requests/${id}`);
  }
  deleteCompletedInternalRequests(): Observable<void> {
    return this.http.delete<void>(`${this.base}/internal-requests/completed`);
  }

  // External Requests
  getAllExternalRequests(): Observable<ExternalRequestResponse[]> {
    return this.http.get<Api<ExternalRequestResponse[]>>(`${this.base}/external-requests`).pipe(map(r => r.data));
  }
  updateExternalRequestStatus(id: number, status: string): Observable<ExternalRequestResponse> {
    return this.http.patch<Api<ExternalRequestResponse>>(`${this.base}/external-requests/${id}/status`, { status }).pipe(map(r => r.data));
  }
  deleteExternalRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/external-requests/${id}`);
  }
  deleteCompletedExternalRequests(): Observable<void> {
    return this.http.delete<void>(`${this.base}/external-requests/completed`);
  }
}
