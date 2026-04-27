package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record BeneficioRequest(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 255) String descricao,
        @NotNull @DecimalMin(value = "0.00", message = "valor não pode ser negativo") @Digits(integer = 13, fraction = 2) BigDecimal valor,
        Boolean ativo
) {
}
