package com.example.ejb.exception;

public class BeneficioInativoException extends RuntimeException {

    public BeneficioInativoException(Long beneficioId) {
        super(String.format("Benefício %d está inativo e não pode participar da transferência", beneficioId));
    }
}
