package com.example.ejb.exception;

public class BeneficioNaoEncontradoException extends RuntimeException {

    public BeneficioNaoEncontradoException(Long beneficioId) {
        super(String.format("Benefício %d não encontrado", beneficioId));
    }
}
