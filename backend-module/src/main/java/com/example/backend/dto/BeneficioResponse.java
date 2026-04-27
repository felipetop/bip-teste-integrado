package com.example.backend.dto;

import java.math.BigDecimal;

public record BeneficioResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal valor,
        Boolean ativo
) {
}
