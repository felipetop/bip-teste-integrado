import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { BeneficioResponse } from '../../../core/api/models';

@Component({
  selector: 'app-beneficios-picker',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './beneficios-picker.component.html',
})
export class BeneficiosPickerComponent {
  readonly titulo = input.required<string>();
  readonly placeholder = input<string>('Buscar...');
  readonly opcoes = input.required<BeneficioResponse[]>();
  readonly selectedId = input<number | null>(null);

  readonly selecionado = output<BeneficioResponse>();

  protected readonly searchTerm = signal('');

  protected readonly filtradas = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    if (!t) return this.opcoes();
    return this.opcoes().filter(
      (b) =>
        b.nome.toLowerCase().includes(t) ||
        (b.descricao ?? '').toLowerCase().includes(t),
    );
  });
}
