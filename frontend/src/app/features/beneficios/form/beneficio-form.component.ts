import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-beneficio-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './beneficio-form.component.html',
})
export class BeneficioFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BeneficioService);
  private readonly notifier = inject(NotificationService);

  protected readonly id = signal<number | null>(null);
  protected readonly modoEditar = computed(() => this.id() !== null);
  protected readonly enviando = signal(false);

  protected readonly form = this.fb.group({
    nome: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    descricao: this.fb.control('', [Validators.maxLength(255)]),
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]) as FormControl<number | null>,
    ativo: this.fb.control(true),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obterPorId(id).subscribe((b) => {
        this.form.patchValue({
          nome: b.nome,
          descricao: b.descricao,
          valor: b.valor,
          ativo: b.ativo,
        });
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nome: this.form.controls.nome.value,
      descricao: this.form.controls.descricao.value,
      valor: this.form.controls.valor.value!,
      ativo: this.form.controls.ativo.value,
    };

    this.enviando.set(true);
    const id = this.id();
    const acao$ = id !== null
      ? this.service.atualizar(id, payload)
      : this.service.criar(payload);

    acao$.subscribe({
      next: () => {
        this.notifier.success(
          this.modoEditar() ? 'Benefício atualizado.' : 'Benefício criado.',
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
