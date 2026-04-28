import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { of } from 'rxjs';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { TransferirComponent } from './transferir.component';

describe('TransferirComponent', () => {
  let fixture: ComponentFixture<TransferirComponent>;
  let component: TransferirComponent;

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
          useValue: {
            beneficios: () => [
              { id: 1, nome: 'Vale Refeição', descricao: 'crédito mensal', valor: 1000, ativo: true },
              { id: 2, nome: 'Vale Transporte', descricao: 'auxílio', valor: 500, ativo: true },
              { id: 3, nome: 'Inativo', descricao: '', valor: 100, ativo: false },
            ],
            carregar: () => undefined,
          },
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

  it('buscaOrigem filtra apenas a coluna origem', () => {
    setup();
    component['buscaOrigem'].set('refeição');
    expect(component['opcoesOrigem']().length).toBe(1);
    expect(component['opcoesOrigem']()[0].nome).toBe('Vale Refeição');
    expect(component['opcoesDestino']().length).toBe(2);
  });

  it('buscaDestino filtra apenas a coluna destino (por descrição)', () => {
    setup();
    component['buscaDestino'].set('auxílio');
    expect(component['opcoesDestino']().length).toBe(1);
    expect(component['opcoesDestino']()[0].id).toBe(2);
    expect(component['opcoesOrigem']().length).toBe(2);
  });

  it('opcoesDestino exclui o que já foi selecionado como origem', () => {
    setup();
    component['selecionarOrigem'](1);
    expect(component['opcoesDestino']().map((b) => b.id)).toEqual([2]);
  });

  it('opcoesOrigem exclui o que já foi selecionado como destino', () => {
    setup();
    component['selecionarDestino'](2);
    expect(component['opcoesOrigem']().map((b) => b.id)).toEqual([1]);
  });

  it('podeEnviar é false sem origem, destino ou valor', () => {
    setup();
    expect(component['podeEnviar']()).toBe(false);
  });

  it('selecionar mesmo id em origem e destino limpa o outro', () => {
    setup();
    component['selecionarOrigem'](1);
    component['selecionarDestino'](2);
    component['selecionarOrigem'](2);
    expect(component['fromId']()).toBe(2);
    expect(component['toId']()).toBe(null);
  });

  it('clicar duas vezes no mesmo item desseleciona (toggle)', () => {
    setup();
    component['selecionarOrigem'](1);
    expect(component['fromId']()).toBe(1);

    component['selecionarOrigem'](1);
    expect(component['fromId']()).toBe(null);
  });

  it('toggle de destino também funciona', () => {
    setup();
    component['selecionarDestino'](2);
    expect(component['toId']()).toBe(2);

    component['selecionarDestino'](2);
    expect(component['toId']()).toBe(null);
  });

  it('saldoOrigemApos = saldo origem - valor', () => {
    setup();
    component['selecionarOrigem'](1);
    component['amount'].set(150);
    expect(component['saldoOrigemApos']()).toBe(850);
  });

  it('saldoDestinoApos = saldo destino + valor', () => {
    setup();
    component['selecionarDestino'](2);
    component['amount'].set(150);
    expect(component['saldoDestinoApos']()).toBe(650);
  });

  it('saldoSuficiente é true quando saldo >= valor e valor > 0', () => {
    setup();
    component['selecionarOrigem'](1);
    component['amount'].set(500);
    expect(component['saldoSuficiente']()).toBe(true);
  });

  it('saldoSuficiente é false quando valor excede saldo', () => {
    setup();
    component['selecionarOrigem'](1);
    component['amount'].set(99999);
    expect(component['saldoSuficiente']()).toBe(false);
  });

  it('podeEnviar fica true com origem, destino diferentes e valor válido', () => {
    setup();
    component['selecionarOrigem'](1);
    component['selecionarDestino'](2);
    component['amount'].set(100);
    expect(component['podeEnviar']()).toBe(true);
  });
});
