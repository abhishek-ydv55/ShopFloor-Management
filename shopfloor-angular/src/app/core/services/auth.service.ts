import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  empId?: string;
}

interface LoginResponse {
  data: {
    token: string;
    email: string;
    name: string;
    role: string;
    empId: string;
  };
}

const ROLE_ROUTE: Record<string, string> = {
  admin:                    '/admin',
  manager:                  '/manager',
  maintenance_manager:      '/manager',
  supervisor:               '/supervisor',
  technician:               '/technician',
  maintenance_supervisor:   '/maintenance',
  procurement:              '/procurement',
  inventory:                '/inventory',
};

const USER_KEY = 'shopfloor_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(this._loadUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
  ) {}

  private _loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        const { token, email: e, name, role, empId } = res.data;
        this.tokenService.setToken(token);
        const user: AuthUser = { email: e, name, role, empId };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getRedirectRoute(role: string): string {
    return ROLE_ROUTE[role] ?? '/login';
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null && this.tokenService.isTokenPresent();
  }

  getRole(): string {
    return this.currentUser()?.role ?? '';
  }
}
