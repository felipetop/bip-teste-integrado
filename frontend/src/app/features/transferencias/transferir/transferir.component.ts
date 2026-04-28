import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { BeneficioResponse } from '../../../core/api/models';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BeneficiosPickerComponent } from '../../../shared/ui/beneficios-picker/beneficios-picker.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-transferir',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ButtonComponent, NgxMaskDirective, BeneficiosPickerComponent],
  templateUrl: './transferir.component.html',
})
export class TransferirComponent implements OnInit {
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly notifier = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly buscaOrigem = signal('');
  protected readonly buscaDestino = signal('');
  protected readonly fromId = signal<number | null>(null);
  protected readonly toId = signal<number | null>(null);
  protected readonly amount = signal<number | null>(null);
  protected readonly enviando = signal(false);

  protected readonly opcoesOrigem = computed(() =>
    this.filtrar(this.buscaOrigem()).filter((b) => b.id !== this.toId()),
  );

  protected readonly opcoesDestino = computed(() =>
    this.filtrar(this.buscaDestino()).filter((b) => b.id !== this.fromId()),
  );

  private filtrar(termo: string) {
    const t = termo.trim().toLowerCase();
    return this.beneficioService
      .beneficios()
      .filter((b) => b.ativo)
      .filter((b) => {
        if (!t) return true;
        return (
          b.nome.toLowerCase().includes(t) ||
          (b.descricao ?? '').toLowerCase().includes(t)
        );
      });
  }

  protected readonly origem = computed<BeneficioResponse | undefined>(() =>
    this.beneficioService.beneficios().find((b) => b.id === this.fromId()),
  );

  protected readonly destino = computed<BeneficioResponse | undefined>(() =>
    this.beneficioService.beneficios().find((b) => b.id === this.toId()),
  );

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

  protected readonly podeEnviar = computed(
    () =>
      !!this.origem() &&
      !!this.destino() &&
      this.fromId() !== this.toId() &&
      this.saldoSuficiente(),
  );

  ngOnInit(): void {
    if (this.beneficioService.beneficios().length === 0) {
      this.beneficioService.carregar();
    }
  }

  selecionarOrigem(id: number): void {
    if (this.fromId() === id) {
      this.fromId.set(null);
      return;
    }
    this.fromId.set(id);
    if (this.toId() === id) {
      this.toId.set(null);
    }
  }

  selecionarDestino(id: number): void {
    if (this.toId() === id) {
      this.toId.set(null);
      return;
    }
    this.toId.set(id);
    if (this.fromId() === id) {
      this.fromId.set(null);
    }
  }

  transferir(): void {
    if (!this.podeEnviar()) return;

    this.enviando.set(true);
    this.transferenciaService
      .transferir({
        fromId: this.fromId()!,
        toId: this.toId()!,
        amount: this.amount()!,
      })
      .subscribe({
        next: () => {
          this.notifier.success(
            `Transferência efetuada: ${this.formatarMoeda(this.valor())}`,
          );
          this.router.navigate(['/beneficios']);
        },
        error: () => this.enviando.set(false),
      });
  }

  cancelar(): void {
    this.router.navigate(['/beneficios']);
  }

  private formatarMoeda(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
