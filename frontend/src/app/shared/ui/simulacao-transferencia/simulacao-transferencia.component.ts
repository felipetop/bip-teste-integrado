import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { BeneficioResponse } from '../../../core/api/models';

@Component({
  selector: 'app-simulacao-transferencia',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, NgxMaskDirective],
  templateUrl: './simulacao-transferencia.component.html',
})
export class SimulacaoTransferenciaComponent {
  readonly origem = input<BeneficioResponse | undefined>(undefined);
  readonly destino = input<BeneficioResponse | undefined>(undefined);
  readonly amount = model<number | null>(null);

  protected readonly valor = computed(() => this.amount() ?? 0);

  protected readonly saldoOrigemApos = computed(
    () => (this.origem()?.valor ?? 0) - this.valor(),
  );

  protected readonly saldoDestinoApos = computed(
    () => (this.destino()?.valor ?? 0) + this.valor(),
  );

  protected readonly saldoSuficiente = computed(
    () => (this.origem()?.valor ?? 0) >= this.valor() && this.valor() > 0,
  );

  protected readonly podeAnimar = computed(
    () => !!this.origem() && !!this.destino() && this.saldoSuficiente(),
  );
}
