import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let svc: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    svc = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => expect(svc).toBeTruthy());

  it('should return error for wrong password', () => {
    expect(svc.login('admin@tcs.com', 'wrongpass')).toBe('Incorrect password');
  });

  it('should return error for unknown email', () => {
    expect(svc.login('unknown@tcs.com', 'Password1!')).toBe('Unauthorized email');
  });

  it('should return null (success) for valid credentials', () => {
    expect(svc.login('admin@tcs.com', 'Password1!')).toBeNull();
  });

  it('should set currentUser on successful login', () => {
    svc.login('admin@tcs.com', 'Password1!');
    expect(svc.currentUser()?.role).toBe('admin');
  });

  it('should return isLoggedIn true after login', () => {
    svc.login('tech@tcs.com', 'Password1!');
    expect(svc.isLoggedIn()).toBeTrue();
  });

  it('should clear user on logout', () => {
    svc.login('admin@tcs.com', 'Password1!');
    svc.logout();
    expect(svc.currentUser()).toBeNull();
  });

  it('should return correct redirect route', () => {
    expect(svc.getRedirectRoute('admin@tcs.com')).toBe('/admin');
    expect(svc.getRedirectRoute('tech@tcs.com')).toBe('/technician');
    expect(svc.getRedirectRoute('man@tcs.com')).toBe('/manager');
  });

  it('getRole should return empty string when not logged in', () => {
    expect(svc.getRole()).toBe('');
  });

  it('getRole should return role after login', () => {
    svc.login('super@tcs.com', 'Password1!');
    expect(svc.getRole()).toBe('supervisor');
  });
});
