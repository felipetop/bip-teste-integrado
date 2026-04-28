import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-beneficios-list',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent],
  templateUrl: './beneficios-list.component.html',
})
export class BeneficiosListComponent implements OnInit {
  protected readonly service = inject(BeneficioService);

  ngOnInit(): void {
    this.service.carregar();
  }

  desativar(id: number): void {
    this.service.desativar(id).subscribe();
  }
}
