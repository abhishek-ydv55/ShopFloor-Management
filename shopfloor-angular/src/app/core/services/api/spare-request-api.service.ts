import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface SpareRequestResponse {
  id: number; requestCode: string; item: string; qty: number;
  machine: string; priority: string; status: string;
  requestedBy: string; notes?: string; createdAt: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class SpareRequestApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/spare-requests`;

  getAll(): Observable<SpareRequestResponse[]> {
    return this.http.get<Api<SpareRequestResponse[]>>(this.base).pipe(map(r => r.data));
  }

  getByStatus(status: string): Observable<SpareRequestResponse[]> {
    return this.http.get<Api<SpareRequestResponse[]>>(`${this.base}/status/${status}`).pipe(map(r => r.data));
  }

  getByUser(empId: string): Observable<SpareRequestResponse[]> {
    return this.http.get<Api<SpareRequestResponse[]>>(`${this.base}/user/${empId}`).pipe(map(r => r.data));
  }

  create(body: { item: string; qty: number; machine: string; priority: string; notes?: string; requestedBy: string }): Observable<SpareRequestResponse> {
    return this.http.post<Api<SpareRequestResponse>>(this.base, body).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: string): Observable<SpareRequestResponse> {
    return this.http.patch<Api<SpareRequestResponse>>(`${this.base}/${id}/status`, { status }).pipe(map(r => r.data));
  }

  /** Procurement: item confirmed in inventory → forward to Inventory team */
  procurementApprove(id: number): Observable<SpareRequestResponse> {
    return this.http.post<Api<SpareRequestResponse>>(`${this.base}/${id}/procurement-approve`, {}).pipe(map(r => r.data));
  }

  /** Procurement: item not in inventory → raise external procurement */
  procurementSendToExternal(id: number): Observable<SpareRequestResponse> {
    return this.http.post<Api<SpareRequestResponse>>(`${this.base}/${id}/procurement-external`, {}).pipe(map(r => r.data));
  }

  /** Inventory: item not in stock — raise external procurement request */
  inventorySendToExternal(id: number): Observable<SpareRequestResponse> {
    return this.http.post<Api<SpareRequestResponse>>(`${this.base}/${id}/inventory-external`, {}).pipe(map(r => r.data));
  }

  /** Inventory: deduct stock and close request */
  fulfill(id: number): Observable<SpareRequestResponse> {
    return this.http.post<Api<SpareRequestResponse>>(`${this.base}/${id}/fulfill`, {}).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Delete all terminal records: Fulfilled, SentToExternal, Rejected */
  deleteCompleted(): Observable<void> {
    return this.http.delete<void>(`${this.base}/completed`);
  }
}
