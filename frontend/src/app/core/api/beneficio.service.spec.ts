import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BeneficioService } from './beneficio.service';
import { BeneficioRequest, BeneficioResponse } from './models';

describe('BeneficioService', () => {
  const baseUrl = `${environment.apiBaseUrl}/api/v1/beneficios`;
  let service: BeneficioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BeneficioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carregar() preenche o signal beneficios com a resposta', () => {
    const mock: BeneficioResponse[] = [
      { id: 1, nome: 'A', descricao: '', valor: 100, ativo: true },
      { id: 2, nome: 'B', descricao: '', valor: 200, ativo: true },
    ];

    service.carregar();
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(service.beneficios()).toEqual(mock);
    expect(service.loading()).toBe(false);
  });

  it('criar() faz POST e adiciona ao signal', () => {
    const payload: BeneficioRequest = { nome: 'Novo', descricao: '', valor: 50, ativo: true };
    const novo: BeneficioResponse = { id: 3, ...payload, ativo: true };

    service.criar(payload).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(novo);

    expect(service.beneficios()).toContainEqual(novo);
  });

  it('atualizar() faz PUT e substitui no signal', () => {
    service.carregar();
    http.expectOne(baseUrl).flush([
      { id: 1, nome: 'Antigo', descricao: '', valor: 100, ativo: true },
    ]);

    const payload: BeneficioRequest = { nome: 'Atualizado', descricao: 'novo', valor: 150, ativo: true };
    service.atualizar(1, payload).subscribe();
    const req = http.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, ...payload });

    expect(service.beneficios()[0].nome).toBe('Atualizado');
    expect(service.beneficios()[0].valor).toBe(150);
  });

  it('desativar() faz DELETE e marca ativo=false no signal', () => {
    service.carregar();
    http.expectOne(baseUrl).flush([
      { id: 1, nome: 'A', descricao: '', valor: 100, ativo: true },
    ]);

    service.desativar(1).subscribe();
    const req = http.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.beneficios()[0].ativo).toBe(false);
  });

  it('ativos é computed que filtra somente os ativos', () => {
    service.carregar();
    http.expectOne(baseUrl).flush([
      { id: 1, nome: 'A', descricao: '', valor: 100, ativo: true },
      { id: 2, nome: 'B', descricao: '', valor: 200, ativo: false },
      { id: 3, nome: 'C', descricao: '', valor: 300, ativo: true },
    ]);

    expect(service.ativos().length).toBe(2);
    expect(service.ativos().map((b) => b.id)).toEqual([1, 3]);
  });
});
