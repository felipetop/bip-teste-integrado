import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransferenciaRequest, TransferenciaResponse } from './models';

@Injectable({ providedIn: 'root' })
export class TransferenciaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/transferencias`;

  transferir(request: TransferenciaRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(this.baseUrl, request);
  }
}
