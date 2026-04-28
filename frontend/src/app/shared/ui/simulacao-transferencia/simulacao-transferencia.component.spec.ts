import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { BeneficioResponse } from '../../../core/api/models';
import { SimulacaoTransferenciaComponent } from './simulacao-transferencia.component';

describe('SimulacaoTransferenciaComponent', () => {
  let fixture: ComponentFixture<SimulacaoTransferenciaComponent>;
  let component: SimulacaoTransferenciaComponent;

  const origem: BeneficioResponse = {
    id: 1, nome: 'A', descricao: '', valor: 1000, ativo: true,
  };
  const destino: BeneficioResponse = {
    id: 2, nome: 'B', descricao: '', valor: 500, ativo: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SimulacaoTransferenciaComponent],
      providers: [provideEnvironmentNgxMask()],
    });
    fixture = TestBed.createComponent(SimulacaoTransferenciaComponent);
    component = fixture.componentInstance;
  });

  function setInputs(o?: BeneficioResponse, d?: BeneficioResponse, v?: number) {
    fixture.componentRef.setInput('origem', o);
    fixture.componentRef.setInput('destino', d);
    fixture.componentRef.setInput('amount', v ?? null);
    fixture.detectChanges();
  }

  it('saldoOrigemApos = origem.valor - amount', () => {
    setInputs(origem, destino, 150);
    expect(component['saldoOrigemApos']()).toBe(850);
  });

  it('saldoDestinoApos = destino.valor + amount', () => {
    setInputs(origem, destino, 150);
    expect(component['saldoDestinoApos']()).toBe(650);
  });

  it('saldoSuficiente é true quando origem.valor >= amount > 0', () => {
    setInputs(origem, destino, 500);
    expect(component['saldoSuficiente']()).toBe(true);
  });

  it('saldoSuficiente é false quando amount excede saldo', () => {
    setInputs(origem, destino, 99999);
    expect(component['saldoSuficiente']()).toBe(false);
  });

  it('podeAnimar é true quando origem, destino selecionados e saldo suficiente', () => {
    setInputs(origem, destino, 100);
    expect(component['podeAnimar']()).toBe(true);
  });

  it('podeAnimar é false sem origem ou destino', () => {
    setInputs(undefined, destino, 100);
    expect(component['podeAnimar']()).toBe(false);
  });
});
