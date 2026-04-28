import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { BeneficioService } from './beneficio.service';
import { TransferenciaRepository } from './transferencia.repository';
import { TransferenciaRequest } from './models';

@Injectable({ providedIn: 'root' })
export class TransferenciaService {
  private readonly repository = inject(TransferenciaRepository);
  private readonly beneficioService = inject(BeneficioService);

  transferir(request: TransferenciaRequest) {
    return this.repository.transferir(request).pipe(
      tap(() => this.beneficioService.carregar()),
    );
  }
}
