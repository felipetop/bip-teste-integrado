import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  text: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(text: string, durationMs = 3000): void {
    this.show(text, 'success', durationMs);
  }

  error(text: string, durationMs = 5000): void {
    this.show(text, 'error', durationMs);
  }

  info(text: string, durationMs = 3000): void {
    this.show(text, 'info', durationMs);
  }

  dismiss(id: string): void {
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }

  private show(text: string, type: ToastType, durationMs: number): void {
    const id = crypto.randomUUID();
    this._toasts.update((arr) => [...arr, { id, text, type }]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }
}
