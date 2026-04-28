import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BeneficioRequest, BeneficioResponse } from './models';

@Injectable({ providedIn: 'root' })
export class BeneficioRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/beneficios`;

  findAll(): Observable<BeneficioResponse[]> {
    return this.http.get<BeneficioResponse[]>(this.baseUrl);
  }

  findById(id: number): Observable<BeneficioResponse> {
    return this.http.get<BeneficioResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: BeneficioRequest): Observable<BeneficioResponse> {
    return this.http.post<BeneficioResponse>(this.baseUrl, request);
  }

  update(id: number, request: BeneficioRequest): Observable<BeneficioResponse> {
    return this.http.put<BeneficioResponse>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
