package com.example.ejb.exception;

import java.math.BigDecimal;

public class SaldoInsuficienteException extends RuntimeException {

    public SaldoInsuficienteException(Long beneficioId, BigDecimal saldoAtual, BigDecimal valorSolicitado) {
        super(String.format(
                "Saldo insuficiente no benefício %d: saldo atual %s, valor solicitado %s",
                beneficioId, saldoAtual, valorSolicitado));
    }
}
