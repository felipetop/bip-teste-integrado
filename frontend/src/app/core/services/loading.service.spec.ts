import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('isLoading começa false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('start() ativa isLoading', () => {
    service.start();
    expect(service.isLoading()).toBe(true);
  });

  it('stop() desativa quando contador volta a zero', () => {
    service.start();
    service.stop();
    expect(service.isLoading()).toBe(false);
  });

  it('mantém isLoading true enquanto há requests paralelas em voo', () => {
    service.start();
    service.start();
    service.start();
    expect(service.isLoading()).toBe(true);

    service.stop();
    expect(service.isLoading()).toBe(true);

    service.stop();
    expect(service.isLoading()).toBe(true);

    service.stop();
    expect(service.isLoading()).toBe(false);
  });

  it('stop() em excesso não deixa o contador negativo', () => {
    service.stop();
    service.stop();
    service.stop();
    expect(service.isLoading()).toBe(false);

    service.start();
    expect(service.isLoading()).toBe(true);
  });
});
