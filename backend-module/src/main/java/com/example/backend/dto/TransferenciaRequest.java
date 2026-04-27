package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransferenciaRequest(
        @NotNull Long fromId,
        @NotNull Long toId,
        @NotNull @DecimalMin(value = "0.01", message = "valor deve ser positivo") @Digits(integer = 13, fraction = 2) BigDecimal amount
) {
}
