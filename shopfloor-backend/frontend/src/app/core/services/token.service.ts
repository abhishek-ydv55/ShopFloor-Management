import { Injectable } from '@angular/core';

const TOKEN_KEY = 'shopfloor_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isTokenPresent(): boolean {
    return !!this.getToken();
  }
}
