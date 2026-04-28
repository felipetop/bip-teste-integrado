import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('inicia com lista vazia de toasts', () => {
    expect(service.toasts().length).toBe(0);
  });

  it('success() adiciona um toast do tipo success', () => {
    service.success('Salvo!', 0);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].text).toBe('Salvo!');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('error() adiciona um toast do tipo error', () => {
    service.error('Falhou', 0);
    expect(service.toasts()[0].type).toBe('error');
  });

  it('info() adiciona um toast do tipo info', () => {
    service.info('Aviso', 0);
    expect(service.toasts()[0].type).toBe('info');
  });

  it('dismiss() remove toast pelo id', () => {
    service.success('A', 0);
    service.success('B', 0);
    const idA = service.toasts()[0].id;

    service.dismiss(idA);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].text).toBe('B');
  });

  it('mantém a ordem de chegada', () => {
    service.success('primeiro', 0);
    service.success('segundo', 0);
    service.success('terceiro', 0);

    expect(service.toasts().map((t) => t.text)).toEqual([
      'primeiro',
      'segundo',
      'terceiro',
    ]);
  });
});
