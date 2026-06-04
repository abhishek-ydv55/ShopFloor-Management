import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  isOpen  = signal(false);
  title   = signal('Confirm');
  message = signal('');

  private resolveFn?: (value: boolean) => void;

  ask(message: string, title = 'Confirm'): Promise<boolean> {
    this.message.set(message);
    this.title.set(title);
    this.isOpen.set(true);
    return new Promise(resolve => { this.resolveFn = resolve; });
  }

  confirm(): void { this.isOpen.set(false); this.resolveFn?.(true); }
  dismiss(): void { this.isOpen.set(false); this.resolveFn?.(false); }
}
