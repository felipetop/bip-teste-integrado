import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ProblemDetail } from '../api/models';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifier = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const problem = err.error as ProblemDetail | null;
      const mensagem = formatarMensagem(err, problem);
      notifier.error(mensagem);
      return throwError(() => err);
    }),
  );
};

function formatarMensagem(err: HttpErrorResponse, problem: ProblemDetail | null): string {
  if (problem?.erros?.length) {
    return problem.erros.join(' · ');
  }
  if (problem?.detail) {
    return problem.detail;
  }
  if (problem?.title) {
    return problem.title;
  }
  if (err.status === 0) {
    return 'Não foi possível conectar à API.';
  }
  return `Erro ${err.status}: ${err.message}`;
}
