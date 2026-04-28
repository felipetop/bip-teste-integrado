import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { BeneficioResponse } from '../../../core/api/models';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BeneficiosPickerComponent } from '../../../shared/ui/beneficios-picker/beneficios-picker.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SimulacaoTransferenciaComponent } from '../../../shared/ui/simulacao-transferencia/simulacao-transferencia.component';

@Component({
  selector: 'app-transferir',
  standalone: true,
  imports: [
    CurrencyPipe,
    ButtonComponent,
    BeneficiosPickerComponent,
    SimulacaoTransferenciaComponent,
  ],
  templateUrl: './transferir.component.html',
})
export class TransferirComponent implements OnInit {
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly notifier = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly origem = signal<BeneficioResponse | null>(null);
  protected readonly destino = signal<BeneficioResponse | null>(null);
  protected readonly amount = signal<number | null>(null);
  protected readonly enviando = signal(false);

  private readonly ativos = computed(() =>
    this.beneficioService.beneficios().filter((b) => b.ativo),
  );

  protected readonly opcoesOrigem = computed(() =>
    this.ativos().filter((b) => b.id !== this.destino()?.id),
  );

  protected readonly opcoesDestino = computed(() =>
    this.ativos().filter((b) => b.id !== this.origem()?.id),
  );

  protected readonly valor = computed(() => this.amount() ?? 0);

  protected readonly podeEnviar = computed(() => {
    const o = this.origem();
    const d = this.destino();
    const v = this.valor();
    return !!o && !!d && v > 0 && o.valor >= v;
  });

  ngOnInit(): void {
    if (this.beneficioService.beneficios().length === 0) {
      this.beneficioService.carregar();
    }
  }

  selecionarOrigem(b: BeneficioResponse): void {
    this.origem.update((atual) => (atual?.id === b.id ? null : b));
    if (this.destino()?.id === b.id) this.destino.set(null);
  }

  selecionarDestino(b: BeneficioResponse): void {
    this.destino.update((atual) => (atual?.id === b.id ? null : b));
    if (this.origem()?.id === b.id) this.origem.set(null);
  }

  transferir(): void {
    if (!this.podeEnviar()) return;
    this.enviando.set(true);
    this.transferenciaService
      .transferir({
        fromId: this.origem()!.id,
        toId: this.destino()!.id,
        amount: this.amount()!,
      })
      .subscribe({
        next: () => {
          this.notifier.success(
            `Transferência efetuada: ${this.valor().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
          );
          this.router.navigate(['/beneficios']);
        },
        error: () => this.enviando.set(false),
      });
  }

  cancelar(): void {
    this.router.navigate(['/beneficios']);
  }
}
