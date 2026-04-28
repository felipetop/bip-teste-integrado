export interface BeneficioResponse {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
}

export interface BeneficioRequest {
  nome: string;
  descricao: string;
  valor: number;
  ativo?: boolean;
}

export interface TransferenciaRequest {
  fromId: number;
  toId: number;
  amount: number;
}

export interface TransferenciaResponse {
  fromId: number;
  toId: number;
  amount: number;
  saldoOrigem: number;
  saldoDestino: number;
}

// RFC 7807 Problem Details (formato de erro do GlobalExceptionHandler)
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  erros?: string[];
}
