package com.example.backend.exception;

import com.example.ejb.exception.BeneficioInativoException;
import com.example.ejb.exception.BeneficioNaoEncontradoException;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.TransferenciaInvalidaException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BeneficioNaoEncontradoException.class)
    public ProblemDetail handleNaoEncontrado(BeneficioNaoEncontradoException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Benefício não encontrado");
        return pd;
    }

    @ExceptionHandler(SaldoInsuficienteException.class)
    public ProblemDetail handleSaldoInsuficiente(SaldoInsuficienteException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        pd.setTitle("Saldo insuficiente");
        return pd;
    }

    @ExceptionHandler(BeneficioInativoException.class)
    public ProblemDetail handleInativo(BeneficioInativoException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        pd.setTitle("Benefício inativo");
        return pd;
    }

    @ExceptionHandler(TransferenciaInvalidaException.class)
    public ProblemDetail handleTransferenciaInvalida(TransferenciaInvalidaException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        pd.setTitle("Transferência inválida");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        List<String> erros = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dados inválidos");
        pd.setTitle("Validação falhou");
        pd.setProperty("erros", erros);
        return pd;
    }
}
