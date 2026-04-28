import { CurrencyPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { startWith } from 'rxjs';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-transferir',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, ButtonComponent],
  templateUrl: './transferir.component.html',
})
export class TransferirComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly notifier = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);

  protected readonly opcoes = computed(() =>
    this.beneficioService.beneficios().filter((b) => b.ativo),
  );

  protected readonly form = this.fb.group(
    {
      fromId: this.fb.control<number | null>(null, [Validators.required]) as FormControl<number | null>,
      toId: this.fb.control<number | null>(null, [Validators.required]) as FormControl<number | null>,
      amount: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
      ]) as FormControl<number | null>,
    },
    { validators: [origemDestinoDiferentes] },
  );

  private readonly fromIdSignal = toSignal(
    this.form.controls.fromId.valueChanges.pipe(startWith(this.form.controls.fromId.value)),
    { initialValue: null as number | null },
  );

  protected readonly saldoOrigem = computed(() => {
    const id = this.fromIdSignal();
    if (!id) return null;
    return this.beneficioService.beneficios().find((b) => b.id === id)?.valor ?? null;
  });

  ngOnInit(): void {
    if (this.beneficioService.beneficios().length === 0) {
      this.beneficioService.carregar();
    }
  }

  transferir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fromId, toId, amount } = this.form.getRawValue();
    this.enviando.set(true);
    this.transferenciaService
      .transferir({ fromId: fromId!, toId: toId!, amount: amount! })
      .subscribe({
        next: (resp) => {
          this.notifier.success(
            `Transferência efetuada. Saldo de origem: R$ ${resp.saldoOrigem.toFixed(2)}`,
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

function origemDestinoDiferentes(group: AbstractControl): ValidationErrors | null {
  const fromId = group.get('fromId')?.value;
  const toId = group.get('toId')?.value;
  if (fromId && toId && fromId === toId) {
    return { origemIgualDestino: true };
  }
  return null;
}
