package com.example.backend.service;

import com.example.backend.dto.BeneficioResponse;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.domain.Beneficio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BeneficioService {

    private final BeneficioRepository repository;

    public BeneficioService(BeneficioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> listar() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private BeneficioResponse toResponse(Beneficio b) {
        return new BeneficioResponse(
                b.getId(),
                b.getNome(),
                b.getDescricao(),
                b.getValor(),
                b.getAtivo()
        );
    }
}
