package com.example.backend.service;

import com.example.backend.dto.TransferenciaRequest;
import com.example.backend.dto.TransferenciaResponse;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.domain.Beneficio;
import com.example.ejb.exception.BeneficioNaoEncontradoException;
import com.example.ejb.service.BeneficioEjbService;
import org.springframework.stereotype.Service;

@Service
public class TransferenciaService {

    private final BeneficioEjbService ejbService;
    private final BeneficioRepository repository;

    public TransferenciaService(BeneficioEjbService ejbService, BeneficioRepository repository) {
        this.ejbService = ejbService;
        this.repository = repository;
    }

    public TransferenciaResponse transferir(TransferenciaRequest request) {
        ejbService.transfer(request.fromId(), request.toId(), request.amount());

        Beneficio from = repository.findById(request.fromId())
                .orElseThrow(() -> new BeneficioNaoEncontradoException(request.fromId()));
        Beneficio to = repository.findById(request.toId())
                .orElseThrow(() -> new BeneficioNaoEncontradoException(request.toId()));

        return new TransferenciaResponse(
                request.fromId(),
                request.toId(),
                request.amount(),
                from.getValor(),
                to.getValor()
        );
    }
}
