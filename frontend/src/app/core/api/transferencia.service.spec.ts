import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BeneficioService } from './beneficio.service';
import { TransferenciaRepository } from './transferencia.repository';
import { TransferenciaService } from './transferencia.service';

describe('TransferenciaService', () => {
  let service: TransferenciaService;
  let repositoryMock: { transferir: ReturnType<typeof vi.fn> };
  let beneficioServiceMock: { carregar: ReturnType<typeof vi.fn> };

  const respostaMock = {
    fromId: 1,
    toId: 2,
    amount: 100,
    saldoOrigem: 900,
    saldoDestino: 600,
  };

  beforeEach(() => {
    repositoryMock = { transferir: vi.fn().mockReturnValue(of(respostaMock)) };
    beneficioServiceMock = { carregar: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: TransferenciaRepository, useValue: repositoryMock },
        { provide: BeneficioService, useValue: beneficioServiceMock },
      ],
    });
    service = TestBed.inject(TransferenciaService);
  });

  it('repassa a request para o repository', () => {
    const requisicao = { fromId: 1, toId: 2, amount: 100 };
    service.transferir(requisicao).subscribe();
    expect(repositoryMock.transferir).toHaveBeenCalledWith(requisicao);
  });

  it('recarrega benefícios após transferência bem-sucedida', () => {
    service.transferir({ fromId: 1, toId: 2, amount: 100 }).subscribe();
    expect(beneficioServiceMock.carregar).toHaveBeenCalledTimes(1);
  });

  it('emite a resposta da transferência para o consumer', () => {
    let recebido: typeof respostaMock | undefined;
    service.transferir({ fromId: 1, toId: 2, amount: 100 }).subscribe(
      (resposta) => (recebido = resposta),
    );
    expect(recebido).toEqual(respostaMock);
  });
});
