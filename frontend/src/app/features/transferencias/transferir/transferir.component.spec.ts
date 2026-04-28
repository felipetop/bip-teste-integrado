import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { of } from 'rxjs';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { BeneficioResponse } from '../../../core/api/models';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { TransferirComponent } from './transferir.component';

describe('TransferirComponent', () => {
  let fixture: ComponentFixture<TransferirComponent>;
  let component: TransferirComponent;

  const beneficios: BeneficioResponse[] = [
    { id: 1, nome: 'Vale Refeição', descricao: 'crédito mensal', valor: 1000, ativo: true },
    { id: 2, nome: 'Vale Transporte', descricao: 'auxílio', valor: 500, ativo: true },
    { id: 3, nome: 'Inativo', descricao: '', valor: 100, ativo: false },
  ];

  function setup() {
    TestBed.configureTestingModule({
      imports: [TransferirComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideEnvironmentNgxMask(),
        {
          provide: BeneficioService,
          useValue: { beneficios: () => beneficios, carregar: () => undefined },
        },
        {
          provide: TransferenciaService,
          useValue: {
            transferir: () =>
              of({ fromId: 1, toId: 2, amount: 100, saldoOrigem: 900, saldoDestino: 600 }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(TransferirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('opcoesOrigem e opcoesDestino mostram apenas ativos', () => {
    setup();
    expect(component['opcoesOrigem']().length).toBe(2);
    expect(component['opcoesDestino']().length).toBe(2);
  });

  it('podeEnviar é false sem origem, destino ou valor', () => {
    setup();
    expect(component['podeEnviar']()).toBe(false);
  });

  it('selecionar origem e destino diferentes torna podeEnviar true se valor é válido', () => {
    setup();
    component['selecionarOrigem'](beneficios[0]);
    component['selecionarDestino'](beneficios[1]);
    component['amount'].set(100);
    expect(component['podeEnviar']()).toBe(true);
  });

  it('selecionar o mesmo benefício duas vezes desseleciona (toggle)', () => {
    setup();
    component['selecionarOrigem'](beneficios[0]);
    expect(component['origem']()?.id).toBe(1);
    component['selecionarOrigem'](beneficios[0]);
    expect(component['origem']()).toBe(null);
  });

  it('selecionar como origem o item já marcado como destino limpa o destino', () => {
    setup();
    component['selecionarDestino'](beneficios[0]);
    component['selecionarOrigem'](beneficios[0]);
    expect(component['origem']()?.id).toBe(1);
    expect(component['destino']()).toBe(null);
  });

  it('opcoesDestino exclui o que já foi selecionado como origem', () => {
    setup();
    component['selecionarOrigem'](beneficios[0]);
    expect(component['opcoesDestino']().map((b) => b.id)).toEqual([2]);
  });

  it('opcoesOrigem exclui o que já foi selecionado como destino', () => {
    setup();
    component['selecionarDestino'](beneficios[1]);
    expect(component['opcoesOrigem']().map((b) => b.id)).toEqual([1]);
  });

  it('podeEnviar é false quando valor excede saldo', () => {
    setup();
    component['selecionarOrigem'](beneficios[0]);
    component['selecionarDestino'](beneficios[1]);
    component['amount'].set(99999);
    expect(component['podeEnviar']()).toBe(false);
  });
});
