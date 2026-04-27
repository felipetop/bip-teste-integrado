package com.example.ejb.exception;

public class TransferenciaInvalidaException extends RuntimeException {

    public TransferenciaInvalidaException(String motivo) {
        super("Transferência inválida: " + motivo);
    }
}
