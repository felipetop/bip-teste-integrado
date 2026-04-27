package com.example.backend.dto;

import java.math.BigDecimal;

public record TransferenciaResponse(
        Long fromId,
        Long toId,
        BigDecimal amount,
        BigDecimal saldoOrigem,
        BigDecimal saldoDestino
) {
}
