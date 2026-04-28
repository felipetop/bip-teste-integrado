import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BeneficioService } from '../../../core/api/beneficio.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BeneficioFormComponent } from './beneficio-form.component';

describe('BeneficioFormComponent', () => {
  let fixture: ComponentFixture<BeneficioFormComponent>;
  let component: BeneficioFormComponent;

  function setup(idParam: string | null = null) {
    TestBed.configureTestingModule({
      imports: [BeneficioFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => idParam } } },
        },
      ],
    });
    fixture = TestBed.createComponent(BeneficioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('inicia em modo criação quando não há id na rota', () => {
    setup(null);
    expect(component['modoEditar']()).toBe(false);
    expect(component['form'].controls.ativo.value).toBe(true);
  });

  it('marca o form inválido quando nome está vazio', () => {
    setup(null);
    const form = component['form'];
    form.controls.nome.setValue('');
    form.controls.valor.setValue(10);

    expect(form.invalid).toBe(true);
    expect(form.controls.nome.hasError('required')).toBe(true);
  });

  it('marca o form inválido quando valor é negativo', () => {
    setup(null);
    const form = component['form'];
    form.controls.nome.setValue('Vale Cultura');
    form.controls.valor.setValue(-1);

    expect(form.controls.valor.hasError('min')).toBe(true);
  });

  it('form fica válido com dados completos', () => {
    setup(null);
    const form = component['form'];
    form.controls.nome.setValue('Vale Cultura');
    form.controls.descricao.setValue('Auxílio cultural');
    form.controls.valor.setValue(200);

    expect(form.valid).toBe(true);
  });

  it('em modo edição carrega o benefício pelo id e popula o form', () => {
    TestBed.configureTestingModule({
      imports: [BeneficioFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '7' } } },
        },
        {
          provide: BeneficioService,
          useValue: {
            obterPorId: () =>
              of({ id: 7, nome: 'Vale Saúde', descricao: 'plano', valor: 350, ativo: true }),
          },
        },
        { provide: NotificationService, useValue: {} },
      ],
    });
    const f = TestBed.createComponent(BeneficioFormComponent);
    f.detectChanges();

    const c = f.componentInstance;
    expect(c['modoEditar']()).toBe(true);
    expect(c['form'].controls.nome.value).toBe('Vale Saúde');
    expect(c['form'].controls.valor.value).toBe(350);
  });
});
