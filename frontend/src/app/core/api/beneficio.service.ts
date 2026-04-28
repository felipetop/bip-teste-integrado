import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { BeneficioRepository } from './beneficio.repository';
import { BeneficioRequest, BeneficioResponse } from './models';

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private readonly repository = inject(BeneficioRepository);

  private readonly _beneficios = signal<BeneficioResponse[]>([]);
  private readonly _loading = signal(false);

  readonly beneficios = this._beneficios.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly ativos = computed(() => this._beneficios().filter((b) => b.ativo));

  obterPorId(id: number) {
    return this.repository.findById(id);
  }

  carregar(): void {
    this._loading.set(true);
    this.repository.findAll().subscribe({
      next: (lista) => this._beneficios.set(lista),
      complete: () => this._loading.set(false),
      error: () => this._loading.set(false),
    });
  }

  criar(request: BeneficioRequest) {
    return this.repository.create(request).pipe(
      tap((novo) => this._beneficios.update((arr) => [...arr, novo])),
    );
  }

  atualizar(id: number, request: BeneficioRequest) {
    return this.repository.update(id, request).pipe(
      tap((atualizado) =>
        this._beneficios.update((arr) =>
          arr.map((b) => (b.id === id ? atualizado : b)),
        ),
      ),
    );
  }

  desativar(id: number) {
    return this.repository.deactivate(id).pipe(
      tap(() =>
        this._beneficios.update((arr) =>
          arr.map((b) => (b.id === id ? { ...b, ativo: false } : b)),
        ),
      ),
    );
  }
}
