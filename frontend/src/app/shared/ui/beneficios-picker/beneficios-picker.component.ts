import { CurrencyPipe } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
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
  readonly searchTerm = model<string>('');

  readonly selecionado = output<number>();
}
