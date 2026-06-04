import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface InventoryItemResponse {
  id: number; category: string; name: string;
  qty: number; threshold: number; unit: string; location: string;
}
interface Api<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory`;

  getAll(): Observable<InventoryItemResponse[]> {
    return this.http.get<Api<InventoryItemResponse[]>>(this.base).pipe(map(r => r.data));
  }

  create(body: { category: string; name: string; qty: number; threshold: number; unit: string; location: string }): Observable<InventoryItemResponse> {
    return this.http.post<Api<InventoryItemResponse>>(this.base, body).pipe(map(r => r.data));
  }

  update(id: number, body: { category: string; name: string; qty: number; threshold: number; unit: string; location: string }): Observable<InventoryItemResponse> {
    return this.http.put<Api<InventoryItemResponse>>(`${this.base}/${id}`, body).pipe(map(r => r.data));
  }

  updateQty(id: number, qty: number): Observable<InventoryItemResponse> {
    return this.http.patch<Api<InventoryItemResponse>>(`${this.base}/${id}/qty`, { qty }).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
