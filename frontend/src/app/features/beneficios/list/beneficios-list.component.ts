import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-beneficios-list',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent],
  templateUrl: './beneficios-list.component.html',
})
export class BeneficiosListComponent implements OnInit {
  protected readonly service = inject(BeneficioService);
  private readonly router = inject(Router);
  private readonly notifier = inject(NotificationService);

  ngOnInit(): void {
    this.service.carregar();
  }

  novo(): void {
    this.router.navigate(['/beneficios/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/beneficios', id, 'editar']);
  }

  desativar(id: number): void {
    this.service.desativar(id).subscribe({
      next: () => this.notifier.success('Benefício desativado.'),
    });
  }
}
