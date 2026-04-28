import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _pending = signal(0);
  readonly isLoading = computed(() => this._pending() > 0);

  start(): void {
    this._pending.update((n) => n + 1);
  }

  stop(): void {
    this._pending.update((n) => Math.max(0, n - 1));
  }
}
