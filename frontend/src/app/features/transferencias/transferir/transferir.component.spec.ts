import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { TransferenciaService } from '../../../core/api/transferencia.service';
import { TransferirComponent } from './transferir.component';

describe('TransferirComponent', () => {
  let fixture: ComponentFixture<TransferirComponent>;
  let component: TransferirComponent;

  function setup(beneficios = [
    { id: 1, nome: 'A', descricao: '', valor: 1000, ativo: true },
    { id: 2, nome: 'B', descricao: '', valor: 500, ativo: true },
    { id: 3, nome: 'Inativo', descricao: '', valor: 100, ativo: false },
  ]) {
    TestBed.configureTestingModule({
      imports: [TransferirComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BeneficioService,
          useValue: {
            beneficios: () => beneficios,
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

  it('opcoes mostra apenas benefícios ativos', () => {
    setup();
    expect(component['opcoes']().length).toBe(2);
    expect(component['opcoes']().map((b) => b.id)).toEqual([1, 2]);
  });

  it('form começa inválido (campos obrigatórios vazios)', () => {
    setup();
    expect(component['form'].invalid).toBe(true);
  });

  it('marca origemIgualDestino quando origem == destino', () => {
    setup();
    const form = component['form'];
    form.controls.fromId.setValue(1);
    form.controls.toId.setValue(1);
    form.controls.amount.setValue(50);

    expect(form.hasError('origemIgualDestino')).toBe(true);
    expect(form.invalid).toBe(true);
  });

  it('rejeita amount menor que 0.01', () => {
    setup();
    component['form'].controls.amount.setValue(0);
    expect(component['form'].controls.amount.hasError('min')).toBe(true);
  });

  it('form fica válido com origem, destino diferentes e valor positivo', () => {
    setup();
    const form = component['form'];
    form.controls.fromId.setValue(1);
    form.controls.toId.setValue(2);
    form.controls.amount.setValue(100);

    expect(form.valid).toBe(true);
  });

  it('saldoOrigem reflete o saldo do benefício selecionado', () => {
    setup();
    component['form'].controls.fromId.setValue(1);
    expect(component['saldoOrigem']()).toBe(1000);

    component['form'].controls.fromId.setValue(2);
    expect(component['saldoOrigem']()).toBe(500);
  });
});
